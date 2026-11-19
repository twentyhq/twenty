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
  tokenizeValidationRuleExpression,
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
import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatValidationRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-validation-rule.type';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';

type ValidationRuleFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  'flatFieldMetadataMaps' | 'flatObjectMetadataMaps'
>;

const isFieldActiveInWorkspace = (field: UniversalFlatFieldMetadata): boolean =>
  resolveEffectiveFlatEntityProperty({
    metadataName: 'fieldMetadata',
    flatEntity: field,
    property: 'isActive',
  });

// The sync keeps a workspace's deactivation of a field this manifest still declares
const isFieldActiveAfterSync = ({
  field,
  existingAllFlatEntityMaps,
}: {
  field: UniversalFlatFieldMetadata;
  existingAllFlatEntityMaps: ValidationRuleFlatEntityMaps;
}): boolean =>
  isFieldActiveInWorkspace(
    existingAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
      field.universalIdentifier
    ] ?? field,
  );

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

  const fieldAfterSync = isDefined(objectUniversalIdentifier)
    ? fieldsAfterSyncByObjectUniversalIdentifier
        .get(objectUniversalIdentifier)
        ?.find((field) => field.name === name)
    : undefined;

  if (
    isDefined(fieldAfterSync) &&
    !isFieldActiveAfterSync({
      field: fieldAfterSync,
      existingAllFlatEntityMaps,
    })
  ) {
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

const buildFieldRemovedFromApplicationException = ({
  validationRuleName,
  fieldName,
}: {
  validationRuleName: string;
  fieldName: string;
}): ApplicationException =>
  new ApplicationException(
    `Validation rule "${validationRuleName}" uses the field "${fieldName}", which no longer exists. Update the rule's expression or add the field back to your app.`,
    ApplicationExceptionCode.INVALID_INPUT,
  );

const toComparableTokens = (expression: string) =>
  tokenizeValidationRuleExpression(expression).filter(
    (token) => token.type !== 'whitespace',
  );

// The field-rename side effect rewrote the saved rule, so the manifest still holds the old names.
// Only fields outside the app can be renamed that way: the app names its own fields in the manifest.
const isSavedExpressionRenamedFromManifest = ({
  manifestExpression,
  existingFlatValidationRule,
  ownerFlatApplication,
  existingAllFlatEntityMaps,
}: {
  manifestExpression: string;
  existingFlatValidationRule: Pick<
    UniversalFlatValidationRule,
    'expression' | 'bindings'
  >;
  ownerFlatApplication: Pick<FlatApplication, 'id'>;
  existingAllFlatEntityMaps: ValidationRuleFlatEntityMaps;
}): boolean => {
  const isBoundToFieldOutsideApplication = (path: string): boolean => {
    const boundFieldUniversalIdentifier =
      existingFlatValidationRule.bindings[path];
    const boundField = isDefined(boundFieldUniversalIdentifier)
      ? existingAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
          boundFieldUniversalIdentifier
        ]
      : undefined;

    return (
      isDefined(boundField) &&
      boundField.applicationId !== ownerFlatApplication.id
    );
  };

  const isRenamedPath = ({
    manifestPath,
    savedPath,
  }: {
    manifestPath: string;
    savedPath: string;
  }): boolean => {
    const manifestSegments = manifestPath.split('.');
    const savedSegments = savedPath.split('.');

    return (
      manifestSegments.length === savedSegments.length &&
      savedSegments.every(
        (savedSegment, index) =>
          savedSegment === manifestSegments[index] ||
          isBoundToFieldOutsideApplication(
            savedSegments.slice(0, index + 1).join('.'),
          ),
      )
    );
  };

  const manifestTokens = toComparableTokens(manifestExpression);
  const savedTokens = toComparableTokens(existingFlatValidationRule.expression);

  return (
    manifestTokens.length === savedTokens.length &&
    manifestTokens.every((manifestToken, index) => {
      const savedToken = savedTokens[index];

      if (savedToken?.type !== manifestToken.type) {
        return false;
      }

      return (
        savedToken.text === manifestToken.text ||
        (savedToken.type === 'path' &&
          isRenamedPath({
            manifestPath: manifestToken.text,
            savedPath: savedToken.text,
          }))
      );
    })
  );
};

// Checks every bound field, so the result doesn't depend on which field the compiler reports first
const findBoundFieldRemovedFromApplication = ({
  existingFlatValidationRule,
  ownerFlatApplication,
  fieldsAfterSyncByObjectUniversalIdentifier,
  existingAllFlatEntityMaps,
}: {
  existingFlatValidationRule: Pick<UniversalFlatValidationRule, 'bindings'>;
  ownerFlatApplication: Pick<FlatApplication, 'id'>;
  fieldsAfterSyncByObjectUniversalIdentifier: Map<
    string,
    UniversalFlatFieldMetadata[]
  >;
  existingAllFlatEntityMaps: ValidationRuleFlatEntityMaps;
}): string | undefined => {
  const fieldUniversalIdentifiersAfterSync = new Set(
    [...fieldsAfterSyncByObjectUniversalIdentifier.values()]
      .flat()
      .map((field) => field.universalIdentifier),
  );

  return Object.entries(existingFlatValidationRule.bindings).find(
    ([, boundFieldUniversalIdentifier]) =>
      existingAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        boundFieldUniversalIdentifier
      ]?.applicationId === ownerFlatApplication.id &&
      !fieldUniversalIdentifiersAfterSync.has(boundFieldUniversalIdentifier),
  )?.[0];
};

const resolveCompilationOutcome = ({
  validationRuleManifest,
  existingFlatValidationRule,
  activeFieldsByObjectUniversalIdentifier,
  ...fieldLookups
}: Pick<
  Parameters<typeof findUnavailableField>[0],
  | 'ownerFlatApplication'
  | 'fieldsAfterSyncByObjectUniversalIdentifier'
  | 'existingAllFlatEntityMaps'
> & {
  validationRuleManifest: Pick<
    ValidationRuleManifest,
    'name' | 'objectUniversalIdentifier' | 'expression'
  >;
  existingFlatValidationRule:
    | Pick<UniversalFlatValidationRule, 'expression' | 'bindings' | 'isActive'>
    | undefined;
  activeFieldsByObjectUniversalIdentifier: Map<
    string,
    UniversalFlatFieldMetadata[]
  >;
}): {
  expression: string;
  bindings: ValidationRuleBindings;
  isActive: boolean;
} => {
  const compile = (
    expression: string,
    fieldsByObjectUniversalIdentifier: Map<
      string,
      UniversalFlatFieldMetadata[]
    >,
  ) =>
    compileValidationRuleExpression({
      expression,
      fields: buildFieldDescriptors({
        objectUniversalIdentifier:
          validationRuleManifest.objectUniversalIdentifier,
        activeFieldsByObjectUniversalIdentifier:
          fieldsByObjectUniversalIdentifier,
      }),
    });

  const manifestCompilationResult = compile(
    validationRuleManifest.expression,
    activeFieldsByObjectUniversalIdentifier,
  );

  if (manifestCompilationResult.isValid) {
    return {
      expression: validationRuleManifest.expression,
      bindings: manifestCompilationResult.bindings,
      isActive: existingFlatValidationRule?.isActive ?? true,
    };
  }

  const expression =
    isDefined(existingFlatValidationRule) &&
    isSavedExpressionRenamedFromManifest({
      manifestExpression: validationRuleManifest.expression,
      existingFlatValidationRule,
      ownerFlatApplication: fieldLookups.ownerFlatApplication,
      existingAllFlatEntityMaps: fieldLookups.existingAllFlatEntityMaps,
    })
      ? existingFlatValidationRule.expression
      : validationRuleManifest.expression;

  const compilationResult =
    expression === validationRuleManifest.expression
      ? manifestCompilationResult
      : compile(expression, activeFieldsByObjectUniversalIdentifier);

  if (compilationResult.isValid) {
    return {
      expression,
      bindings: compilationResult.bindings,
      isActive: existingFlatValidationRule?.isActive ?? true,
    };
  }

  if (existingFlatValidationRule?.expression === expression) {
    const removedFieldName = findBoundFieldRemovedFromApplication({
      existingFlatValidationRule,
      ...fieldLookups,
    });

    if (isDefined(removedFieldName)) {
      throw buildFieldRemovedFromApplicationException({
        validationRuleName: validationRuleManifest.name,
        fieldName: removedFieldName,
      });
    }
  }

  const compilationWithInactiveFieldsResult = compile(
    expression,
    fieldLookups.fieldsAfterSyncByObjectUniversalIdentifier,
  );

  if (compilationWithInactiveFieldsResult.isValid) {
    return {
      expression,
      bindings: compilationWithInactiveFieldsResult.bindings,
      isActive: false,
    };
  }

  const unavailableField = findUnavailableField({
    validationRuleManifest: { ...validationRuleManifest, expression },
    existingFlatValidationRule,
    errorCode: compilationWithInactiveFieldsResult.errorCode,
    errorParams: compilationWithInactiveFieldsResult.errorParams,
    ...fieldLookups,
  });

  if (!isDefined(unavailableField)) {
    throw new ApplicationException(
      `Validation rule "${validationRuleManifest.name}" has an invalid expression: ${compilationWithInactiveFieldsResult.errorMessage}`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }

  if (unavailableField.state === 'removedFromApplication') {
    throw buildFieldRemovedFromApplicationException({
      validationRuleName: validationRuleManifest.name,
      fieldName: unavailableField.name,
    });
  }

  return {
    expression,
    bindings: existingFlatValidationRule?.bindings ?? {},
    isActive: false,
  };
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
}): void => {
  if (validationRules.length === 0) {
    return;
  }

  const fieldsAfterSync = computeFieldsAfterSync({
    ownerFlatApplication,
    inferDeletionFromMissingEntities,
    existingAllFlatEntityMaps,
    toAllUniversalFlatEntityMaps,
  });
  const fieldsAfterSyncByObjectUniversalIdentifier =
    groupFieldsByObjectUniversalIdentifier(fieldsAfterSync);
  const activeFieldsByObjectUniversalIdentifier =
    groupFieldsByObjectUniversalIdentifier(
      fieldsAfterSync.filter((field) =>
        isFieldActiveAfterSync({ field, existingAllFlatEntityMaps }),
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

    const { expression, bindings, isActive } = resolveCompilationOutcome({
      validationRuleManifest,
      existingFlatValidationRule,
      activeFieldsByObjectUniversalIdentifier,
      ownerFlatApplication,
      fieldsAfterSyncByObjectUniversalIdentifier,
      existingAllFlatEntityMaps,
    });

    const isErrorFieldDetached = isErrorFieldDetachedByWorkspace({
      validationRuleManifest,
      existingFlatValidationRule,
      existingAllFlatEntityMaps,
      toAllUniversalFlatEntityMaps,
    });

    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity:
        fromValidationRuleManifestToUniversalFlatValidationRule({
          validationRuleManifest: {
            ...validationRuleManifest,
            expression,
            ...(isErrorFieldDetached
              ? { errorFieldUniversalIdentifier: undefined }
              : {}),
          },
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
};
