import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFieldLookupTarget } from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';
import { type RecordFieldColumnDescriptor } from '@/object-record/record-field/types/RecordFieldColumnDescriptor';
import { isDefined } from 'twenty-shared/utils';

export const getRecordFieldColumnDescriptor = ({
  fieldMetadataItem,
  lookupTarget,
  isFilterable,
  isSortable,
}: {
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
    label: isDefined(lookupTargetFieldMetadataItem)
      ? `${fieldMetadataItem.label} › ${lookupTargetFieldMetadataItem.label}`
      : fieldMetadataItem.label,
    icon: lookupTargetFieldMetadataItem?.icon ?? fieldMetadataItem.icon,
    description:
      lookupTargetFieldMetadataItem?.description ??
      fieldMetadataItem.description,
    // Filter, sort and totals would act on the relation, not on the looked-up field
    isFilterable: isFilterable && !isLookupColumn,
    isSortable: isSortable && !isLookupColumn,
  };
};
