import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { FieldMetadataType } from 'twenty-shared/types';
import { isFieldMetadataEligibleForFieldsWidget } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

export const buildDefaultFieldsWidgetGroups = ({
  fields,
  objectNameSingular,
  labelIdentifierFieldMetadataItemId,
}: {
  fields: FieldMetadataItem[];
  objectNameSingular: string;
  labelIdentifierFieldMetadataItemId: string | undefined;
}): FieldsWidgetGroup[] => {
  const eligibleFields = fields.filter((field) =>
    isFieldMetadataEligibleForFieldsWidget({
      fieldName: field.name,
      fieldType: field.type,
      isLabelIdentifierField: field.id === labelIdentifierFieldMetadataItemId,
    }),
  );

  const standardFields = eligibleFields.filter((field) => !field.isCustom);
  const customFields = eligibleFields.filter((field) => field.isCustom);

  const isFieldVisible = (fieldType: FieldMetadataType) =>
    fieldType !== FieldMetadataType.RELATION &&
    fieldType !== FieldMetadataType.MORPH_RELATION;

  const groups: FieldsWidgetGroup[] = [];
  let globalIndex = 0;

  if (standardFields.length > 0) {
    groups.push({
      id: uuidv4(),
      name: 'General',
      position: 0,
      isVisible: true,
      fields: standardFields.map((field, index) => ({
        fieldMetadataItem: field,
        position: index,
        isVisible: isFieldVisible(field.type),
        globalIndex: globalIndex++,
      })),
    });
  }

  if (customFields.length > 0) {
    groups.push({
      id: uuidv4(),
      name: 'Other',
      position: 1,
      isVisible: true,
      fields: customFields.map((field, index) => ({
        fieldMetadataItem: field,
        position: index,
        isVisible: isFieldVisible(field.type),
        globalIndex: globalIndex++,
      })),
    });
  }

  return groups;
};
