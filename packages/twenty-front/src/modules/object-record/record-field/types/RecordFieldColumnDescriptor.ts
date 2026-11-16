import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFieldLookupTarget } from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';

export type RecordFieldColumnDescriptor = {
  lookupTarget: RecordFieldLookupTarget | undefined;
  label: string;
  icon: FieldMetadataItem['icon'];
  description: FieldMetadataItem['description'];
  isFilterable: boolean;
  isSortable: boolean;
};
