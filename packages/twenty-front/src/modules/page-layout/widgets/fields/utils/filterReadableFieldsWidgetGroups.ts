import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';

export const filterReadableFieldsWidgetGroups = ({
  groups,
  readableFields,
}: {
  groups: FieldsWidgetGroup[];
  readableFields: FieldMetadataItem[];
}): FieldsWidgetGroup[] => {
  const readableFieldIds = new Set(readableFields.map((field) => field.id));

  let globalIndex = 0;

  return groups
    .map((group) => ({
      ...group,
      fields: group.fields
        .filter((field) => readableFieldIds.has(field.fieldMetadataItem.id))
        .map((field) => ({ ...field, globalIndex: globalIndex++ })),
    }))
    .filter((group) => group.fields.length > 0);
};
