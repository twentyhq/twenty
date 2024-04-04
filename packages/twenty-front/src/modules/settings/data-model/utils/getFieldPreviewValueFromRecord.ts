import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SettingsObjectFieldSelectFormValues } from '@/settings/data-model/components/SettingsObjectFieldSelectForm';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getFieldPreviewValueFromRecord = ({
  record,
  fieldMetadataItem,
  selectOptions,
}: {
  record: ObjectRecord;
  fieldMetadataItem: Pick<FieldMetadataItem, 'name' | 'type'>;
  selectOptions?: SettingsObjectFieldSelectFormValues;
}) => {
  const recordFieldValue = record[fieldMetadataItem.name];

  // Select field
  if (fieldMetadataItem.type === FieldMetadataType.Select) {
    return selectOptions?.find(
      (selectOption) => selectOption.value === recordFieldValue,
    )?.value;
  }

  // Relation fields (to many)
  if (
    fieldMetadataItem.type === FieldMetadataType.Relation &&
    Array.isArray(recordFieldValue?.edges)
  ) {
    return recordFieldValue.edges[0]?.node;
  }

  // Other fields
  return recordFieldValue;
};
