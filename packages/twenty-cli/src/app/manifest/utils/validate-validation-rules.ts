import {
  getFieldUniversalIdentifier,
  type Manifest,
  type ValidationRuleManifest,
} from 'twenty-shared/application';
import { RESERVED_SYSTEM_FIELD_TYPE_BY_NAME } from 'twenty-shared/metadata';
import { RelationType } from 'twenty-shared/types';
import {
  compileValidationRuleExpression,
  isDefined,
} from 'twenty-shared/utils';

import {
  isRelationFieldManifest,
  type ManifestField,
} from '@/app/manifest/utils/manifest-validation-helpers';

type ValidationRulesManifest = Pick<
  Manifest,
  'application' | 'fields' | 'objects' | 'validationRules'
>;

type ValidationRuleFields = Parameters<
  typeof compileValidationRuleExpression
>[0]['fields'];

const buildInvalidExpressionError = ({
  name,
  errorMessage,
}: {
  name: string;
  errorMessage: string;
}) => `Validation rule "${name}" has an invalid expression: ${errorMessage}`;

const toFieldDescriptor = (
  field: Pick<ManifestField, 'name' | 'type' | 'universalIdentifier'>,
) => ({
  name: field.name,
  type: field.type,
  universalIdentifier: field.universalIdentifier,
});

const groupDeclaredFieldsByObject = (
  manifest: ValidationRulesManifest,
): Map<string, ManifestField[]> =>
  new Map(
    manifest.objects.map((object) => [
      object.universalIdentifier,
      [
        ...object.fields,
        ...manifest.fields.filter(
          (field) =>
            field.objectUniversalIdentifier === object.universalIdentifier,
        ),
      ],
    ]),
  );

const getGeneratedFields = ({
  manifest: { application },
  objectUniversalIdentifier,
}: {
  manifest: Pick<ValidationRulesManifest, 'application'>;
  objectUniversalIdentifier: string;
}) =>
  Object.entries(RESERVED_SYSTEM_FIELD_TYPE_BY_NAME).map(([name, type]) => ({
    name,
    type,
    universalIdentifier: getFieldUniversalIdentifier({
      applicationUniversalIdentifier: application.universalIdentifier,
      objectUniversalIdentifier,
      name,
    }),
  }));

const getAllFields = ({
  manifest,
  declaredFieldsByObject,
  objectUniversalIdentifier,
}: {
  manifest: ValidationRulesManifest;
  declaredFieldsByObject: Map<string, ManifestField[]>;
  objectUniversalIdentifier: string;
}) =>
  [
    ...(declaredFieldsByObject.get(objectUniversalIdentifier) ?? []),
    ...getGeneratedFields({ manifest, objectUniversalIdentifier }),
  ].map(toFieldDescriptor);

const buildFieldDescriptors = ({
  manifest,
  declaredFieldsByObject,
  objectUniversalIdentifier,
}: {
  manifest: ValidationRulesManifest;
  declaredFieldsByObject: Map<string, ManifestField[]>;
  objectUniversalIdentifier: string;
}): ValidationRuleFields => [
  ...(declaredFieldsByObject.get(objectUniversalIdentifier) ?? []).map(
    (field) => {
      if (!isRelationFieldManifest(field)) {
        return toFieldDescriptor(field);
      }

      const relationType = field.universalSettings?.relationType;

      if (relationType !== RelationType.MANY_TO_ONE) {
        return { ...toFieldDescriptor(field), relationType };
      }

      return {
        ...toFieldDescriptor(field),
        relationType,
        relationTargetFields: getAllFields({
          manifest,
          declaredFieldsByObject,
          objectUniversalIdentifier:
            field.relationTargetObjectMetadataUniversalIdentifier,
        }),
      };
    },
  ),
  ...getGeneratedFields({ manifest, objectUniversalIdentifier }).map(
    toFieldDescriptor,
  ),
];

// The CLI can't know the fields of an object outside the app, so the server checks them
const validateRuleOnObjectOutsideApp = ({
  name,
  expression,
}: Pick<ValidationRuleManifest, 'name' | 'expression'>): string[] => {
  const compilationResult = compileValidationRuleExpression({
    expression,
    fields: [],
  });

  return !compilationResult.isValid &&
    compilationResult.errorCode !== 'UNKNOWN_FIELD'
    ? [
        buildInvalidExpressionError({
          name,
          errorMessage: compilationResult.errorMessage,
        }),
      ]
    : [];
};

const validateErrorField = ({
  validationRule: { name, errorFieldUniversalIdentifier },
  objectFields,
}: {
  validationRule: Pick<
    ValidationRuleManifest,
    'name' | 'errorFieldUniversalIdentifier'
  >;
  objectFields: ReturnType<typeof getAllFields>;
}): string[] =>
  isDefined(errorFieldUniversalIdentifier) &&
  !objectFields.some(
    (field) => field.universalIdentifier === errorFieldUniversalIdentifier,
  )
    ? [
        `Validation rule "${name}" shows its error on field "${errorFieldUniversalIdentifier}", which does not belong to the rule's object.`,
      ]
    : [];

const isReadingFieldOutsideApp = ({
  compilationResult,
  declaredFields,
  declaredFieldsByObject,
}: {
  compilationResult: ReturnType<typeof compileValidationRuleExpression>;
  declaredFields: ManifestField[];
  declaredFieldsByObject: Map<string, ManifestField[]>;
}): boolean => {
  if (
    compilationResult.isValid ||
    compilationResult.errorCode !== 'UNKNOWN_RELATION_TARGET_FIELD'
  ) {
    return false;
  }

  const relationField = declaredFields.find(
    (field) => field.name === compilationResult.errorParams?.relationFieldName,
  );

  return (
    isDefined(relationField) &&
    isRelationFieldManifest(relationField) &&
    !declaredFieldsByObject.has(
      relationField.relationTargetObjectMetadataUniversalIdentifier,
    )
  );
};

const validateRuleOnAppObject = ({
  validationRule,
  manifest,
  declaredFields,
  declaredFieldsByObject,
}: {
  validationRule: ValidationRuleManifest;
  manifest: ValidationRulesManifest;
  declaredFields: ManifestField[];
  declaredFieldsByObject: Map<string, ManifestField[]>;
}): string[] => {
  const { name, expression, objectUniversalIdentifier } = validationRule;
  const errorFieldErrors = validateErrorField({
    validationRule,
    objectFields: getAllFields({
      manifest,
      declaredFieldsByObject,
      objectUniversalIdentifier,
    }),
  });
  const compilationResult = compileValidationRuleExpression({
    expression,
    fields: buildFieldDescriptors({
      manifest,
      declaredFieldsByObject,
      objectUniversalIdentifier,
    }),
  });

  if (
    compilationResult.isValid ||
    isReadingFieldOutsideApp({
      compilationResult,
      declaredFields,
      declaredFieldsByObject,
    })
  ) {
    return errorFieldErrors;
  }

  return [
    ...errorFieldErrors,
    buildInvalidExpressionError({
      name,
      errorMessage: compilationResult.errorMessage,
    }),
  ];
};

export const validateValidationRules = (
  manifest: ValidationRulesManifest,
): string[] => {
  const declaredFieldsByObject = groupDeclaredFieldsByObject(manifest);

  return (manifest.validationRules ?? []).flatMap((validationRule) => {
    const declaredFields = declaredFieldsByObject.get(
      validationRule.objectUniversalIdentifier,
    );

    return isDefined(declaredFields)
      ? validateRuleOnAppObject({
          validationRule,
          manifest,
          declaredFields,
          declaredFieldsByObject,
        })
      : validateRuleOnObjectOutsideApp(validationRule);
  });
};
