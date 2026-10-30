/* @license Enterprise */

import { type ValidationRuleManifest } from 'twenty-shared/application';
import {
  FieldMetadataType,
  RelationType,
  type ValidationRuleBindings,
  type ValidationRuleErrorParams,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import {
  compileValidationRuleExpression,
  isDefined,
} from 'twenty-shared/utils';

import { fromValidationRuleManifestToUniversalFlatValidationRule } from 'src/engine/core-modules/application/application-manifest/converters/from-validation-rule-manifest-to-universal-flat-validation-rule.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { isSystemSideEffectFlatEntity } from 'src/engine/metadata-modules/flat-entity/utils/is-system-side-effect-flat-entity.util';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { buildReservedSystemFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-reserved-system-flat-field-metadatas-for-custom-object.util';
import { resolveEffectiveUniversalFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-universal-flat-entity-property.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatValidationRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-validation-rule.type';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';

type ValidationRuleFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  'flatFieldMetadataMaps' | 'flatObjectMetadataMaps'
>;

const isFieldActiveInWorkspace = (field: UniversalFlatFieldMetadata): boolean =>
  resolveEffectiveUniversalFlatEntityProperty({
    metadataName: 'fieldMetadata',
    universalFlatEntity: field,
    property: 'isActive',
  });

const groupFieldsByObjectUniversalIdentifier = (
  fields: (UniversalFlatFieldMetadata | undefined)[],
): Map<string, UniversalFlatFieldMetadata[]> => {
  const fieldsByObjectUniversalIdentifier = new Map<
    string,
    UniversalFlatFieldMetadata[]
  >();

  for (const field of fields) {
    if (!isDefined(field)) {
      continue;
    }

    const objectFields =
      fieldsByObjectUniversalIdentifier.get(
        field.objectMetadataUniversalIdentifier,
      ) ?? [];

    objectFields.push(field);
    fieldsByObjectUniversalIdentifier.set(
      field.objectMetadataUniversalIdentifier,
      objectFields,
    );
  }

  return fieldsByObjectUniversalIdentifier;
};

// Rules compile against the fields the workspace will have once this sync lands
const computeFieldsAfterSync = ({
  ownerFlatApplication,
  inferDeletionFromMissingEntities,
  existingAllFlatEntityMaps,
  toAllUniversalFlatEntityMaps,
}: {
  ownerFlatApplication: Pick<FlatApplication, 'id'>;
  inferDeletionFromMissingEntities: boolean;
  existingAllFlatEntityMaps: ValidationRuleFlatEntityMaps;
  toAllUniversalFlatEntityMaps: ValidationRuleFlatEntityMaps;
}): UniversalFlatFieldMetadata[] => {
  const retainedExistingFields = Object.values(
    existingAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(
    (field) =>
      isDefined(field) &&
      (field.applicationId !== ownerFlatApplication.id ||
        !inferDeletionFromMissingEntities ||
        isSystemSideEffectFlatEntity(field)),
  );
  const reservedFieldsOfNewObjects = Object.values(
    toAllUniversalFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
  ).flatMap((flatObjectMetadata) =>
    isDefined(flatObjectMetadata) &&
    !isDefined(
      existingAllFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        flatObjectMetadata.universalIdentifier
      ],
    )
      ? Object.values(
          buildReservedSystemFlatFieldMetadatasForCustomObject({
            flatObjectMetadata,
          }),
        )
      : [],
  );

  return Object.values(
    Object.fromEntries(
      [
        ...retainedExistingFields,
        ...reservedFieldsOfNewObjects,
        ...Object.values(
          toAllUniversalFlatEntityMaps.flatFieldMetadataMaps
            .byUniversalIdentifier,
        ),
      ]
        .filter(isDefined)
        .map((field) => [field.universalIdentifier, field]),
    ),
  );
};

const toScalarFieldDescriptor = (
  field: UniversalFlatFieldMetadata,
): ValidationRuleFieldDescriptor => ({
  name: field.name,
  type: field.type,
  universalIdentifier: field.universalIdentifier,
});

const buildFieldDescriptors = ({
  objectUniversalIdentifier,
  activeFieldsByObjectUniversalIdentifier,
}: {
  objectUniversalIdentifier: string;
  activeFieldsByObjectUniversalIdentifier: Map<
    string,
    UniversalFlatFieldMetadata[]
  >;
}): ValidationRuleFieldDescriptor[] =>
  (
    activeFieldsByObjectUniversalIdentifier.get(objectUniversalIdentifier) ?? []
  ).map((field) => {
    if (
      !isMorphOrRelationUniversalFlatFieldMetadata(field) ||
      field.type !== FieldMetadataType.RELATION
    ) {
      return toScalarFieldDescriptor(field);
    }

    const relationType = field.universalSettings?.relationType;
    const relationTargetObjectUniversalIdentifier =
      field.relationTargetObjectMetadataUniversalIdentifier;

    return {
      ...toScalarFieldDescriptor(field),
      relationType,
      relationTargetFields:
        relationType === RelationType.MANY_TO_ONE &&
        isDefined(relationTargetObjectUniversalIdentifier)
          ? (
              activeFieldsByObjectUniversalIdentifier.get(
                relationTargetObjectUniversalIdentifier,
              ) ?? []
            ).map(toScalarFieldDescriptor)
          : undefined,
    };
  });

type UnavailableField = {
  name: string;
  state: 'deactivated' | 'deleted' | 'removedFromApplication';
};

// Only a field the application removed itself fails the sync: the developer can't fix the others
const findUnavailableField = ({
  validationRuleManifest,
  existingFlatValidationRule,
  errorCode,
  errorParams,
  ownerFlatApplication,
  existingFieldsByObjectUniversalIdentifier,
  fieldsAfterSyncByObjectUniversalIdentifier,
  existingAllFlatEntityMaps,
}: {
  validationRuleManifest: Pick<
    ValidationRuleManifest,
    'objectUniversalIdentifier' | 'expression'
  >;
  existingFlatValidationRule:
    | Pick<UniversalFlatValidationRule, 'expression' | 'bindings'>
    | undefined;
  errorCode: string | undefined;
  errorParams: ValidationRuleErrorParams | undefined;
  ownerFlatApplication: Pick<FlatApplication, 'id'>;
  existingFieldsByObjectUniversalIdentifier: Map<
    string,
    UniversalFlatFieldMetadata[]
  >;
  fieldsAfterSyncByObjectUniversalIdentifier: Map<
    string,
    UniversalFlatFieldMetadata[]
  >;
  existingAllFlatEntityMaps: ValidationRuleFlatEntityMaps;
}): UnavailableField | undefined => {
  const name = errorParams?.fieldName;

  if (
    !isDefined(name) ||
    (errorCode !== 'UNKNOWN_FIELD' &&
      errorCode !== 'UNKNOWN_RELATION_TARGET_FIELD')
  ) {
    return undefined;
  }

  const { relationFieldName } = errorParams ?? {};
  const objectUniversalIdentifier = isDefined(relationFieldName)
    ? (
        fieldsAfterSyncByObjectUniversalIdentifier.get(
          validationRuleManifest.objectUniversalIdentifier,
        ) ?? []
      ).find((field) => field.name === relationFieldName)
        ?.relationTargetObjectMetadataUniversalIdentifier
    : validationRuleManifest.objectUniversalIdentifier;

  const existingField = isDefined(objectUniversalIdentifier)
    ? existingFieldsByObjectUniversalIdentifier
        .get(objectUniversalIdentifier)
        ?.find((field) => field.name === name)
    : undefined;

  if (isDefined(existingField) && !isFieldActiveInWorkspace(existingField)) {
    return { name, state: 'deactivated' };
  }

  if (
    !isDefined(existingFlatValidationRule) ||
    existingFlatValidationRule.expression !== validationRuleManifest.expression
  ) {
    return undefined;
  }

  const boundFieldUniversalIdentifier =
    existingFlatValidationRule.bindings[
      isDefined(relationFieldName) ? `${relationFieldName}.${name}` : name
    ];

  if (!isDefined(boundFieldUniversalIdentifier)) {
    return undefined;
  }

  const boundField =
    existingAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
      boundFieldUniversalIdentifier
    ];

  return {
    name,
    state:
      boundField?.applicationId === ownerFlatApplication.id
        ? 'removedFromApplication'
        : 'deleted',
  };
};

// The field-deletion side effect already detached this link, so the manifest must not restore it
const isErrorFieldDetachedByWorkspace = ({
  validationRuleManifest: { errorFieldUniversalIdentifier },
  existingFlatValidationRule,
  existingAllFlatEntityMaps,
  toAllUniversalFlatEntityMaps,
}: {
  validationRuleManifest: Pick<
    ValidationRuleManifest,
    'errorFieldUniversalIdentifier'
  >;
  existingFlatValidationRule:
    | Pick<UniversalFlatValidationRule, 'errorFieldMetadataUniversalIdentifier'>
    | undefined;
  existingAllFlatEntityMaps: ValidationRuleFlatEntityMaps;
  toAllUniversalFlatEntityMaps: ValidationRuleFlatEntityMaps;
}): boolean =>
  isDefined(errorFieldUniversalIdentifier) &&
  isDefined(existingFlatValidationRule) &&
  !isDefined(
    existingFlatValidationRule.errorFieldMetadataUniversalIdentifier,
  ) &&
  !isDefined(
    existingAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
      errorFieldUniversalIdentifier
    ],
  ) &&
  !isDefined(
    toAllUniversalFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
      errorFieldUniversalIdentifier
    ],
  );

const buildUnavailableFieldMessage = ({
  validationRuleName,
  unavailableField: { name, state },
}: {
  validationRuleName: string;
  unavailableField: UnavailableField;
}): string => {
  switch (state) {
    case 'deactivated':
      return `Validation rule "${validationRuleName}" was left inactive: it uses the field "${name}", which is deactivated in this workspace. Reactivate the field, then turn the rule back on.`;
    case 'deleted':
      return `Validation rule "${validationRuleName}" was left inactive: it uses the field "${name}", which no longer exists in this workspace. Update the rule's expression or add the field back, then turn the rule back on.`;
    case 'removedFromApplication':
      return `Validation rule "${validationRuleName}" uses the field "${name}", which no longer exists. Update the rule's expression or add the field back to your app.`;
  }
};

export const addValidationRuleManifestsToFlatEntityMapsOrThrow = ({
  validationRules,
  ownerFlatApplication,
  inferDeletionFromMissingEntities,
  existingAllFlatEntityMaps,
  toAllUniversalFlatEntityMaps,
  now,
}: {
  validationRules: ValidationRuleManifest[];
  ownerFlatApplication: Pick<FlatApplication, 'id' | 'universalIdentifier'>;
  inferDeletionFromMissingEntities: boolean;
  existingAllFlatEntityMaps: AllFlatEntityMaps;
  toAllUniversalFlatEntityMaps: AllFlatEntityMaps;
  now: string;
}): { warnings: string[] } => {
  const warnings: string[] = [];

  if (validationRules.length === 0) {
    return { warnings };
  }

  const fieldsAfterSync = computeFieldsAfterSync({
    ownerFlatApplication,
    inferDeletionFromMissingEntities,
    existingAllFlatEntityMaps,
    toAllUniversalFlatEntityMaps,
  });
  const fieldsAfterSyncByObjectUniversalIdentifier =
    groupFieldsByObjectUniversalIdentifier(fieldsAfterSync);
  const existingFieldsByObjectUniversalIdentifier =
    groupFieldsByObjectUniversalIdentifier(
      Object.values(
        existingAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
      ),
    );
  // The sync keeps a workspace's deactivation of a field this manifest still declares
  const activeFieldsByObjectUniversalIdentifier =
    groupFieldsByObjectUniversalIdentifier(
      fieldsAfterSync.filter((field) =>
        isFieldActiveInWorkspace(
          existingAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
            field.universalIdentifier
          ] ?? field,
        ),
      ),
    );

  for (const validationRuleManifest of validationRules) {
    const { objectUniversalIdentifier } = validationRuleManifest;

    const isKnownObject =
      isDefined(
        toAllUniversalFlatEntityMaps.flatObjectMetadataMaps
          .byUniversalIdentifier[objectUniversalIdentifier],
      ) ||
      isDefined(
        existingAllFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
          objectUniversalIdentifier
        ],
      );

    if (!isKnownObject) {
      throw new ApplicationException(
        `Validation rule "${validationRuleManifest.name}" references unknown object ${objectUniversalIdentifier}`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    const existingFlatValidationRule =
      existingAllFlatEntityMaps.flatValidationRuleMaps.byUniversalIdentifier[
        validationRuleManifest.universalIdentifier
      ];

    const compilationResult = compileValidationRuleExpression({
      expression: validationRuleManifest.expression,
      fields: buildFieldDescriptors({
        objectUniversalIdentifier,
        activeFieldsByObjectUniversalIdentifier,
      }),
    });

    let bindings: ValidationRuleBindings;
    let isActive: boolean;

    if (compilationResult.isValid) {
      bindings = compilationResult.bindings;
      isActive = existingFlatValidationRule?.isActive ?? true;
    } else {
      const unavailableField = findUnavailableField({
        validationRuleManifest,
        existingFlatValidationRule,
        errorCode: compilationResult.errorCode,
        errorParams: compilationResult.errorParams,
        ownerFlatApplication,
        existingFieldsByObjectUniversalIdentifier,
        fieldsAfterSyncByObjectUniversalIdentifier,
        existingAllFlatEntityMaps,
      });

      if (!isDefined(unavailableField)) {
        throw new ApplicationException(
          `Validation rule "${validationRuleManifest.name}" has an invalid expression: ${compilationResult.errorMessage}`,
          ApplicationExceptionCode.INVALID_INPUT,
        );
      }

      const message = buildUnavailableFieldMessage({
        validationRuleName: validationRuleManifest.name,
        unavailableField,
      });

      if (unavailableField.state === 'removedFromApplication') {
        throw new ApplicationException(
          message,
          ApplicationExceptionCode.INVALID_INPUT,
        );
      }

      warnings.push(message);
      bindings = existingFlatValidationRule?.bindings ?? {};
      isActive = false;
    }

    const isErrorFieldDetached = isErrorFieldDetachedByWorkspace({
      validationRuleManifest,
      existingFlatValidationRule,
      existingAllFlatEntityMaps,
      toAllUniversalFlatEntityMaps,
    });

    if (isErrorFieldDetached) {
      warnings.push(
        `Validation rule "${validationRuleManifest.name}" is no longer attached to its error field, which does not exist in this workspace.`,
      );
    }

    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity:
        fromValidationRuleManifestToUniversalFlatValidationRule({
          validationRuleManifest: isErrorFieldDetached
            ? {
                ...validationRuleManifest,
                errorFieldUniversalIdentifier: undefined,
              }
            : validationRuleManifest,
          bindings,
          isActive,
          applicationUniversalIdentifier:
            ownerFlatApplication.universalIdentifier,
          now,
        }),
      universalFlatEntityMapsToMutate:
        toAllUniversalFlatEntityMaps.flatValidationRuleMaps,
    });
  }

  return { warnings };
};
