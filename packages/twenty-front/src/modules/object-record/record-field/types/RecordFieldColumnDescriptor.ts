import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFieldAggregateTarget } from '@/object-record/record-column-aggregate/utils/getRecordFieldAggregateTarget';
import { type RecordFieldLookupTarget } from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';

export type RecordFieldColumnDescriptor = {
  lookupTarget: RecordFieldLookupTarget | undefined;
  isLookupColumn: boolean;
  aggregateTarget: RecordFieldAggregateTarget | undefined;
  isAggregateColumn: boolean;
  label: string;
  icon: FieldMetadataItem['icon'];
  description: FieldMetadataItem['description'];
  isFilterable: boolean;
  isSortable: boolean;
};
