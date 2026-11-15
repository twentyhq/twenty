import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFieldLookupTarget } from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';
import { formatLookupColumnLabel } from '@/object-record/record-column-lookup/utils/formatLookupColumnLabel';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { type RecordFieldColumnDescriptor } from '@/object-record/record-field/types/RecordFieldColumnDescriptor';
import { isDefined } from 'twenty-shared/utils';

export const getRecordFieldColumnDescriptor = ({
  recordField,
  fieldMetadataItem,
  lookupTarget,
  isFilterable,
  isSortable,
}: {
  recordField: Pick<RecordField, 'settings'>;
  fieldMetadataItem: Pick<FieldMetadataItem, 'label' | 'icon' | 'description'>;
  lookupTarget: RecordFieldLookupTarget | undefined;
  isFilterable: boolean;
  isSortable: boolean;
}): RecordFieldColumnDescriptor => {
  const lookupTargetFieldMetadataItem =
    lookupTarget?.lookupTargetFieldMetadataItem;
  const isLookupColumn = isDefined(lookupTarget);

  return {
    lookupTarget,
    isLookupColumn,
    label:
      recordField.settings?.label ??
      formatLookupColumnLabel({
        fieldMetadataItem,
        lookupTargetFieldMetadataItem,
      }),
    icon: lookupTargetFieldMetadataItem?.icon ?? fieldMetadataItem.icon,
    description:
      lookupTargetFieldMetadataItem?.description ??
      fieldMetadataItem.description,
    // Filter, sort and totals would act on the relation, not on the looked-up field
    isFilterable: isFilterable && !isLookupColumn,
    isSortable: isSortable && !isLookupColumn,
  };
};
