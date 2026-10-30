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
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { resolveEffectiveUniversalFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-universal-flat-entity-property.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatValidationRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-validation-rule.type';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';

const isFieldActiveInWorkspace = (field: UniversalFlatFieldMetadata): boolean =>
  resolveEffectiveUniversalFlatEntityProperty({
    metadataName: 'fieldMetadata',
    universalFlatEntity: field,
    property: 'isActive',
  });

// Bindings are compiled against the fields the workspace will have once this sync lands:
// other applications' current fields plus the fields this manifest declares.
const groupActiveFieldsByObjectUniversalIdentifier = ({
  ownerFlatApplication,
  existingAllFlatEntityMaps,
  toAllUniversalFlatEntityMaps,
}: {
  ownerFlatApplication: Pick<FlatApplication, 'id'>;
  existingAllFlatEntityMaps: AllFlatEntityMaps;
  toAllUniversalFlatEntityMaps: AllFlatEntityMaps;
}): Map<string, UniversalFlatFieldMetadata[]> => {
  const activeFieldsByObjectUniversalIdentifier = new Map<
    string,
    UniversalFlatFieldMetadata[]
  >();

  const otherApplicationFields = Object.values(
    existingAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(
    (field) =>
      isDefined(field) && field.applicationId !== ownerFlatApplication.id,
  );
  const ownFields = Object.values(
    toAllUniversalFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
  );

  for (const field of [...otherApplicationFields, ...ownFields]) {
    if (!isDefined(field)) {
      continue;
    }

    // The sync keeps a workspace's deactivation of a field this manifest still declares
    const existingField =
      existingAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        field.universalIdentifier
      ];

    if (!isFieldActiveInWorkspace(existingField ?? field)) {
      continue;
    }

    const objectFields =
      activeFieldsByObjectUniversalIdentifier.get(
        field.objectMetadataUniversalIdentifier,
      ) ?? [];

    objectFields.push(field);
    activeFieldsByObjectUniversalIdentifier.set(
      field.objectMetadataUniversalIdentifier,
      objectFields,
    );
  }

  return activeFieldsByObjectUniversalIdentifier;
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

const findExistingFieldByName = ({
  name,
  objectUniversalIdentifier,
  existingAllFlatEntityMaps,
}: {
  name: string;
  objectUniversalIdentifier: string;
  existingAllFlatEntityMaps: AllFlatEntityMaps;
}): UniversalFlatFieldMetadata | undefined =>
  Object.values(
    existingAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
  ).find(
    (field) =>
      isDefined(field) &&
      field.name === name &&
      field.objectMetadataUniversalIdentifier === objectUniversalIdentifier,
  );

// A rule whose field left the workspace outside this application is not something
// the developer can fix, so only a field the application removed itself fails the sync.
const findUnavailableField = ({
  validationRuleManifest,
  existingFlatValidationRule,
  errorParams,
  ownerFlatApplication,
  existingAllFlatEntityMaps,
  toAllUniversalFlatEntityMaps,
}: {
  validationRuleManifest: ValidationRuleManifest;
  existingFlatValidationRule: UniversalFlatValidationRule | undefined;
  errorParams: ValidationRuleErrorParams | undefined;
  ownerFlatApplication: Pick<FlatApplication, 'id'>;
  existingAllFlatEntityMaps: AllFlatEntityMaps;
  toAllUniversalFlatEntityMaps: AllFlatEntityMaps;
}): UnavailableField | undefined => {
  const name = errorParams?.fieldName;

  if (!isDefined(name)) {
    return undefined;
  }

  const { relationFieldName } = errorParams ?? {};
  const fieldByUniversalIdentifier = {
    ...existingAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
    ...toAllUniversalFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
  };
  const relationField = isDefined(relationFieldName)
    ? Object.values(fieldByUniversalIdentifier).find(
        (field) =>
          isDefined(field) &&
          field.name === relationFieldName &&
          field.objectMetadataUniversalIdentifier ===
            validationRuleManifest.objectUniversalIdentifier,
      )
    : undefined;
  const objectUniversalIdentifier = isDefined(relationFieldName)
    ? relationField?.relationTargetObjectMetadataUniversalIdentifier
    : validationRuleManifest.objectUniversalIdentifier;

  if (isDefined(objectUniversalIdentifier)) {
    const existingField = findExistingFieldByName({
      name,
      objectUniversalIdentifier,
      existingAllFlatEntityMaps,
    });

    if (isDefined(existingField) && !isFieldActiveInWorkspace(existingField)) {
      return { name, state: 'deactivated' };
    }
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
  existingAllFlatEntityMaps,
  toAllUniversalFlatEntityMaps,
  now,
}: {
  validationRules: ValidationRuleManifest[];
  ownerFlatApplication: Pick<FlatApplication, 'id' | 'universalIdentifier'>;
  existingAllFlatEntityMaps: AllFlatEntityMaps;
  toAllUniversalFlatEntityMaps: AllFlatEntityMaps;
  now: string;
}): { warnings: string[] } => {
  const warnings: string[] = [];

  if (validationRules.length === 0) {
    return { warnings };
  }

  const activeFieldsByObjectUniversalIdentifier =
    groupActiveFieldsByObjectUniversalIdentifier({
      ownerFlatApplication,
      existingAllFlatEntityMaps,
      toAllUniversalFlatEntityMaps,
    });

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
      const unavailableField =
        compilationResult.errorCode === 'UNKNOWN_FIELD' ||
        compilationResult.errorCode === 'UNKNOWN_RELATION_TARGET_FIELD'
          ? findUnavailableField({
              validationRuleManifest,
              existingFlatValidationRule,
              errorParams: compilationResult.errorParams,
              ownerFlatApplication,
              existingAllFlatEntityMaps,
              toAllUniversalFlatEntityMaps,
            })
          : undefined;

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

    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity:
        fromValidationRuleManifestToUniversalFlatValidationRule({
          validationRuleManifest,
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
