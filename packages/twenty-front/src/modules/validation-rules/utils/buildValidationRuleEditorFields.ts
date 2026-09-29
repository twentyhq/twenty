import { COMPOSITE_FIELD_SUB_FIELD_LABELS } from 'twenty-shared/constants';
import {
  compositeTypeDefinitions,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ValidationRuleEditorField } from '@/validation-rules/types/ValidationRuleEditorField';
import { RelationType } from '~/generated-metadata/graphql';

type ValidationRuleEditorObject = Pick<
  EnrichedObjectMetadataItem,
  'id' | 'fields' | 'labelSingular' | 'icon'
>;

const DEFAULT_FIELD_ICON = 'IconListSearch';
const DEFAULT_OBJECT_ICON = 'IconBox';

const isRelationType = (type: FieldMetadataType) =>
  type === FieldMetadataType.RELATION ||
  type === FieldMetadataType.MORPH_RELATION;

const COMPOSITE_SUBFIELD_LABELS_BY_FIELD_TYPE: Partial<
  Record<FieldMetadataType, Record<string, string>>
> = COMPOSITE_FIELD_SUB_FIELD_LABELS;

const getCompositeSubfieldLabel = (
  type: FieldMetadataType,
  subfieldName: string,
): string =>
  COMPOSITE_SUBFIELD_LABELS_BY_FIELD_TYPE[type]?.[subfieldName] ?? subfieldName;

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
  const iconName = fieldMetadataItem.icon ?? DEFAULT_FIELD_ICON;

  const field: ValidationRuleEditorField = {
    path,
    label: fieldMetadataItem.label,
    parentLabel,
    iconName,
    type: fieldMetadataItem.type,
    objectLabelSingular: objectMetadataItem.labelSingular,
    objectIconName: objectMetadataItem.icon ?? DEFAULT_OBJECT_ICON,
    selectOptionValues:
      fieldMetadataItem.options?.map((option) => option.value) ?? [],
    isSystem: fieldMetadataItem.isSystem === true,
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

export const buildValidationRuleEditorFields = ({
  objectMetadataItem,
  objectMetadataItems,
}: {
  objectMetadataItem: ValidationRuleEditorObject;
  objectMetadataItems: ValidationRuleEditorObject[];
}): ValidationRuleEditorField[] =>
  objectMetadataItem.fields
    .filter((fieldMetadataItem) => fieldMetadataItem.isActive === true)
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
          fieldMetadataItem.icon ??
          targetObjectMetadataItem?.icon ??
          DEFAULT_OBJECT_ICON,
        type: fieldMetadataItem.type,
        objectLabelSingular: objectMetadataItem.labelSingular,
        objectIconName: objectMetadataItem.icon ?? DEFAULT_OBJECT_ICON,
        selectOptionValues: [],
        isSystem: fieldMetadataItem.isSystem === true,
        hasMembers: isDefined(targetObjectMetadataItem),
        readsRelatedRecord: true,
      };

      if (!isDefined(targetObjectMetadataItem)) {
        return [relationField];
      }

      const targetFields = targetObjectMetadataItem.fields
        .filter(
          (targetField) =>
            targetField.isActive === true && !isRelationType(targetField.type),
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
