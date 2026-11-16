import { type RecordFieldColumnDescriptor } from '@/object-record/record-field/types/RecordFieldColumnDescriptor';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';

// Lookup cells read the related record from its own store entry, not from the row
export const getLookupRelatedRecords = ({
  records,
  columnDescriptorByRecordFieldId,
}: {
  records: ObjectRecord[];
  columnDescriptorByRecordFieldId: Record<
    string,
    Pick<RecordFieldColumnDescriptor, 'lookupTarget'>
  >;
}): ObjectRecord[] =>
  Object.values(columnDescriptorByRecordFieldId).flatMap(({ lookupTarget }) =>
    isDefined(lookupTarget)
      ? records
          .map(
            (record): ObjectRecord | null | undefined =>
              record[lookupTarget.relationFieldName],
          )
          .filter((relatedRecord): relatedRecord is ObjectRecord =>
            isDefined(relatedRecord?.id),
          )
      : [],
  );
