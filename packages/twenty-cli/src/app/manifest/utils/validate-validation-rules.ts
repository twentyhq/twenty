import { type Manifest } from 'twenty-shared/application';
import { RelationType } from 'twenty-shared/types';
import {
  compileValidationRuleExpression,
  isDefined,
  parseValidationRuleExpression,
} from 'twenty-shared/utils';

import {
  isRelationFieldManifest,
  type ManifestField,
} from '@/app/manifest/utils/manifest-validation-helpers';

type ValidationRuleFields = Parameters<
  typeof compileValidationRuleExpression
>[0]['fields'];

const toFieldDescriptor = (field: ManifestField) => ({
  name: field.name,
  type: field.type,
  universalIdentifier: field.universalIdentifier,
});

export const validateValidationRules = (
  manifest: Pick<Manifest, 'fields' | 'objects' | 'validationRules'>,
): string[] => {
  const errors: string[] = [];
  const declaredObjectUniversalIdentifiers = new Set(
    manifest.objects.map((object) => object.universalIdentifier),
  );
  const fieldsByObjectUniversalIdentifier = new Map<string, ManifestField[]>(
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

  const buildFieldDescriptors = (
    objectFields: ManifestField[],
  ): ValidationRuleFields =>
    objectFields.map((field) => {
      if (!isRelationFieldManifest(field)) {
        return toFieldDescriptor(field);
      }

      const relationType = field.universalSettings?.relationType;
      const targetFields = fieldsByObjectUniversalIdentifier.get(
        field.relationTargetObjectMetadataUniversalIdentifier,
      );

      return {
        ...toFieldDescriptor(field),
        relationType,
        relationTargetFields:
          relationType === RelationType.MANY_TO_ONE
            ? (targetFields ?? []).map(toFieldDescriptor)
            : undefined,
      };
    });

  for (const validationRule of manifest.validationRules ?? []) {
    const { name, expression, objectUniversalIdentifier } = validationRule;
    const objectFields = fieldsByObjectUniversalIdentifier.get(
      objectUniversalIdentifier,
    );

    if (!isDefined(objectFields)) {
      // The object lives outside this app, so only the server knows its fields
      try {
        parseValidationRuleExpression(expression);
      } catch (error) {
        errors.push(
          `Validation rule "${name}" has an invalid expression: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      continue;
    }

    const { errorFieldUniversalIdentifier } = validationRule;

    if (
      isDefined(errorFieldUniversalIdentifier) &&
      !objectFields.some(
        (field) => field.universalIdentifier === errorFieldUniversalIdentifier,
      )
    ) {
      errors.push(
        `Validation rule "${name}" shows its error on field "${errorFieldUniversalIdentifier}", which does not belong to the rule's object.`,
      );
    }

    const compilationResult = compileValidationRuleExpression({
      expression,
      fields: buildFieldDescriptors(objectFields),
    });

    if (compilationResult.isValid) {
      continue;
    }

    const relationField = objectFields.find(
      (field) =>
        field.name === compilationResult.errorParams?.relationFieldName,
    );
    const isReadingFieldOutsideApp =
      compilationResult.errorCode === 'UNKNOWN_RELATION_TARGET_FIELD' &&
      isDefined(relationField) &&
      isRelationFieldManifest(relationField) &&
      !declaredObjectUniversalIdentifiers.has(
        relationField.relationTargetObjectMetadataUniversalIdentifier,
      );

    if (!isReadingFieldOutsideApp) {
      errors.push(
        `Validation rule "${name}" has an invalid expression: ${compilationResult.errorMessage}`,
      );
    }
  }

  return errors;
};
