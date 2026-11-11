import { type MessageDescriptor } from '@lingui/core';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  compositeTypeDefinitions,
  FieldMetadataType,
} from 'twenty-shared/types';
import { VALIDATION_RULE_PREVIOUS_VARIABLE_NAME } from 'twenty-shared/constants';
import {
  computeRelationGqlFieldJoinColumnName,
  isDefined,
} from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getRelationIdFieldNames } from '@/object-metadata/utils/getRelationIdFieldNames';
import { COMPOSITE_FIELD_SUB_FIELD_LABEL_MESSAGES } from '@/settings/data-model/constants/CompositeFieldSubFieldLabelMessages';
import { type ValidationRuleEditorField } from '@/validation-rules/types/ValidationRuleEditorField';
import { type ValidationRuleScope } from '@/validation-rules/types/ValidationRuleScope';
import { RelationType } from '~/generated-metadata/graphql';

type ValidationRuleEditorObject = Pick<
  EnrichedObjectMetadataItem,
  'id' | 'fields' | 'labelSingular' | 'icon'
>;

const DEFAULT_FIELD_ICON = 'IconListSearch';
const DEFAULT_OBJECT_ICON = 'IconBox';

const getObjectIconName = (objectMetadataItem: ValidationRuleEditorObject) =>
  isNonEmptyString(objectMetadataItem.icon)
    ? objectMetadataItem.icon
    : DEFAULT_OBJECT_ICON;

const isRelationType = (type: FieldMetadataType) =>
  type === FieldMetadataType.RELATION ||
  type === FieldMetadataType.MORPH_RELATION;

const COMPOSITE_SUBFIELD_LABELS_BY_FIELD_TYPE: Partial<
  Record<FieldMetadataType, Record<string, MessageDescriptor>>
> = COMPOSITE_FIELD_SUB_FIELD_LABEL_MESSAGES;

const getCompositeSubfieldLabel = (
  type: FieldMetadataType,
  subfieldName: string,
): string => {
  const subfieldLabel =
    COMPOSITE_SUBFIELD_LABELS_BY_FIELD_TYPE[type]?.[subfieldName];

  return isDefined(subfieldLabel) ? t(subfieldLabel) : subfieldName;
};

const buildScalarEditorFields = ({
  fieldMetadataItem,
  objectMetadataItem,
  pathPrefix,
  parentLabel,
  readsRelatedRecord,
}: {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: ValidationRuleEditorObject;
  pathPrefix: string;
  parentLabel: string | null;
  readsRelatedRecord: boolean;
}): ValidationRuleEditorField[] => {
  const compositeType = compositeTypeDefinitions.get(fieldMetadataItem.type);
  const path = `${pathPrefix}${fieldMetadataItem.name}`;
  const iconName = isNonEmptyString(fieldMetadataItem.icon)
    ? fieldMetadataItem.icon
    : DEFAULT_FIELD_ICON;

  const field: ValidationRuleEditorField = {
    path,
    label: fieldMetadataItem.label,
    parentLabel,
    iconName,
    type: fieldMetadataItem.type,
    objectLabelSingular: objectMetadataItem.labelSingular,
    objectIconName: getObjectIconName(objectMetadataItem),
    selectOptionValues:
      fieldMetadataItem.options?.map((option) => option.value) ?? [],
    isSystem: fieldMetadataItem.isSystem ?? false,
    hasMembers: isDefined(compositeType),
    readsRelatedRecord,
  };

  const subfields: ValidationRuleEditorField[] = (
    compositeType?.properties ?? []
  ).map((property) => ({
    ...field,
    path: `${path}.${property.name}`,
    label: getCompositeSubfieldLabel(fieldMetadataItem.type, property.name),
    parentLabel: isDefined(parentLabel)
      ? `${parentLabel} › ${fieldMetadataItem.label}`
      : fieldMetadataItem.label,
    type: property.type,
    selectOptionValues: [],
    hasMembers: false,
  }));

  return [field, ...subfields];
};

// An event carries each morph target as its own join column (targetCompanyId)
const buildMorphTargetIdEditorFields = ({
  fieldMetadataItem,
  objectMetadataItem,
  objectMetadataItems,
}: {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: ValidationRuleEditorObject;
  objectMetadataItems: ValidationRuleEditorObject[];
}): ValidationRuleEditorField[] => {
  const morphRelations = fieldMetadataItem.morphRelations ?? [];

  if (
    !morphRelations.some(
      (morphRelation) => morphRelation.type === RelationType.MANY_TO_ONE,
    )
  ) {
    return [];
  }

  // Join column names come in the same order as the morph relations
  return getRelationIdFieldNames(fieldMetadataItem).map((path, index) => {
    const targetObjectMetadata = morphRelations[index]?.targetObjectMetadata;
    const targetObjectMetadataItem = objectMetadataItems.find(
      (candidate) => candidate.id === targetObjectMetadata?.id,
    );

    return {
      path,
      label:
        targetObjectMetadataItem?.labelSingular ??
        targetObjectMetadata?.nameSingular ??
        path,
      parentLabel: fieldMetadataItem.label,
      iconName:
        [targetObjectMetadataItem?.icon, fieldMetadataItem.icon].find(
          isNonEmptyString,
        ) ?? DEFAULT_OBJECT_ICON,
      type: FieldMetadataType.UUID,
      objectLabelSingular: objectMetadataItem.labelSingular,
      objectIconName: getObjectIconName(objectMetadataItem),
      selectOptionValues: [],
      isSystem: fieldMetadataItem.isSystem ?? false,
      hasMembers: false,
      readsRelatedRecord: false,
    };
  });
};

const buildCurrentValueEditorFields = ({
  objectMetadataItem,
  objectMetadataItems,
  scope,
}: {
  objectMetadataItem: ValidationRuleEditorObject;
  objectMetadataItems: ValidationRuleEditorObject[];
  scope: ValidationRuleScope;
}): ValidationRuleEditorField[] =>
  objectMetadataItem.fields
    .filter((fieldMetadataItem) => fieldMetadataItem.isActive)
    .flatMap((fieldMetadataItem) => {
      if (!isRelationType(fieldMetadataItem.type)) {
        return buildScalarEditorFields({
          fieldMetadataItem,
          objectMetadataItem,
          pathPrefix: '',
          parentLabel: null,
          readsRelatedRecord: false,
        });
      }

      if (
        scope === 'databaseEvent' &&
        fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION
      ) {
        return buildMorphTargetIdEditorFields({
          fieldMetadataItem,
          objectMetadataItem,
          objectMetadataItems,
        });
      }

      const relation = fieldMetadataItem.relation;

      if (
        fieldMetadataItem.type !== FieldMetadataType.RELATION ||
        relation?.type !== RelationType.MANY_TO_ONE
      ) {
        return [];
      }

      const targetObjectMetadataItem = objectMetadataItems.find(
        (candidate) => candidate.id === relation.targetObjectMetadata.id,
      );

      const relationField: ValidationRuleEditorField = {
        path: fieldMetadataItem.name,
        label: fieldMetadataItem.label,
        parentLabel: null,
        iconName:
          [fieldMetadataItem.icon, targetObjectMetadataItem?.icon].find(
            isNonEmptyString,
          ) ?? DEFAULT_OBJECT_ICON,
        type: fieldMetadataItem.type,
        objectLabelSingular: objectMetadataItem.labelSingular,
        objectIconName: getObjectIconName(objectMetadataItem),
        selectOptionValues: [],
        isSystem: fieldMetadataItem.isSystem ?? false,
        hasMembers: isDefined(targetObjectMetadataItem),
        readsRelatedRecord: true,
      };

      if (scope === 'databaseEvent') {
        return [
          {
            ...relationField,
            path: computeRelationGqlFieldJoinColumnName({
              name: fieldMetadataItem.name,
            }),
            type: FieldMetadataType.UUID,
            hasMembers: false,
            readsRelatedRecord: false,
          },
        ];
      }

      if (!isDefined(targetObjectMetadataItem)) {
        return [relationField];
      }

      const targetFields = targetObjectMetadataItem.fields
        .filter(
          (targetField) =>
            targetField.isActive && !isRelationType(targetField.type),
        )
        .flatMap((targetField) =>
          buildScalarEditorFields({
            fieldMetadataItem: targetField,
            objectMetadataItem: targetObjectMetadataItem,
            pathPrefix: `${fieldMetadataItem.name}.`,
            parentLabel: fieldMetadataItem.label,
            readsRelatedRecord: true,
          }),
        );

      return [relationField, ...targetFields];
    });

const buildPreviousValueEditorField = (
  field: ValidationRuleEditorField,
): ValidationRuleEditorField => {
  const previousLabel = t`Previous`;

  return {
    ...field,
    path: `${VALIDATION_RULE_PREVIOUS_VARIABLE_NAME}.${field.path}`,
    parentLabel: isDefined(field.parentLabel)
      ? `${previousLabel} › ${field.parentLabel}`
      : previousLabel,
  };
};

export const buildValidationRuleEditorFields = ({
  objectMetadataItem,
  objectMetadataItems,
  scope = 'record',
}: {
  objectMetadataItem: ValidationRuleEditorObject;
  objectMetadataItems: ValidationRuleEditorObject[];
  scope?: ValidationRuleScope;
}): ValidationRuleEditorField[] => {
  const currentValueFields = buildCurrentValueEditorFields({
    objectMetadataItem,
    objectMetadataItems,
    scope,
  });

  const previousValueFields = currentValueFields
    .filter((field) => !field.readsRelatedRecord)
    .map(buildPreviousValueEditorField);

  return [...currentValueFields, ...previousValueFields];
};
