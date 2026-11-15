import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFieldLookupTarget } from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';
import { type RecordField } from '@/object-record/record-field/types/RecordField';

export type GetRecordFieldLookupTarget = (params: {
  recordField: Pick<RecordField, 'relationTargetFieldMetadataId'>;
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'relation'>;
}) => RecordFieldLookupTarget | undefined;
