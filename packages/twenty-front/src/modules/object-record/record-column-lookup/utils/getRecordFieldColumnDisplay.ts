import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatLookupColumnLabel } from '@/object-record/record-column-lookup/utils/formatLookupColumnLabel';
import { getRecordFieldLookupTarget } from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';
import { type RecordField } from '@/object-record/record-field/types/RecordField';

export const getRecordFieldColumnDisplay = ({
  recordField,
  fieldMetadataItem,
  objectMetadataItems,
}: {
  recordField: Pick<RecordField, 'settings' | 'relationTargetFieldMetadataId'>;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'label' | 'icon' | 'description' | 'type' | 'relation'
  >;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}) => {
  const lookupTargetFieldMetadataItem = getRecordFieldLookupTarget({
    recordField,
    fieldMetadataItem,
    objectMetadataItems,
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
