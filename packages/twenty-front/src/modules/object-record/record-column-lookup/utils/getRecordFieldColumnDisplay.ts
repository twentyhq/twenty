import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatLookupColumnLabel } from '@/object-record/record-column-lookup/utils/formatLookupColumnLabel';
import { type GetRecordFieldLookupTarget } from '@/object-record/record-column-lookup/types/GetRecordFieldLookupTarget';
import { type RecordField } from '@/object-record/record-field/types/RecordField';

export const getRecordFieldColumnDisplay = ({
  recordField,
  fieldMetadataItem,
  getLookupTarget,
}: {
  recordField: Pick<RecordField, 'settings' | 'relationTargetFieldMetadataId'>;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'label' | 'icon' | 'description' | 'type' | 'relation'
  >;
  getLookupTarget: GetRecordFieldLookupTarget;
}) => {
  const lookupTargetFieldMetadataItem = getLookupTarget({
    recordField,
    fieldMetadataItem,
  })?.lookupTargetFieldMetadataItem;

  return {
    label:
      recordField.settings?.label ??
      formatLookupColumnLabel(fieldMetadataItem, lookupTargetFieldMetadataItem),
    icon: lookupTargetFieldMetadataItem?.icon ?? fieldMetadataItem.icon,
    description:
      lookupTargetFieldMetadataItem?.description ??
      fieldMetadataItem.description,
  };
};
