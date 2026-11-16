import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFieldAggregateTarget } from '@/object-record/record-column-aggregate/utils/getRecordFieldAggregateTarget';
import { getRelationAggregateLabel } from '@/object-record/record-column-aggregate/utils/getRelationAggregateLabel';
import { type RecordFieldLookupTarget } from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';
import { type RecordFieldColumnDescriptor } from '@/object-record/record-field/types/RecordFieldColumnDescriptor';
import { formatRelationColumnLabel } from '@/object-record/record-field/utils/formatRelationColumnLabel';
import { isDefined } from 'twenty-shared/utils';

export const getRecordFieldColumnDescriptor = ({
  fieldMetadataItem,
  lookupTarget,
  aggregateTarget,
  isFilterable,
  isSortable,
}: {
  fieldMetadataItem: Pick<FieldMetadataItem, 'label' | 'icon' | 'description'>;
  lookupTarget: RecordFieldLookupTarget | undefined;
  aggregateTarget: RecordFieldAggregateTarget | undefined;
  isFilterable: boolean;
  isSortable: boolean;
}): RecordFieldColumnDescriptor => {
  const targetFieldMetadataItem =
    lookupTarget?.lookupTargetFieldMetadataItem ??
    aggregateTarget?.aggregatedFieldMetadataItem;
  const isRelationTargetColumn =
    isDefined(lookupTarget) || isDefined(aggregateTarget);

  return {
    lookupTarget,
    aggregateTarget,
    isRelationTargetColumn,
    label: formatRelationColumnLabel({
      relationLabel: fieldMetadataItem.label,
      targetLabel: isDefined(aggregateTarget)
        ? getRelationAggregateLabel(aggregateTarget)
        : lookupTarget?.lookupTargetFieldMetadataItem.label,
    }),
    icon: targetFieldMetadataItem?.icon ?? fieldMetadataItem.icon,
    description:
      targetFieldMetadataItem?.description ?? fieldMetadataItem.description,
    // Filter, sort and totals would act on the relation, not on the column's target
    isFilterable: isFilterable && !isRelationTargetColumn,
    isSortable: isSortable && !isRelationTargetColumn,
  };
};
