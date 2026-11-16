import { type RecordFieldLookupTarget } from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';

// Lookup cells read the related record from its own store entry, so the loaders store it next to the rows
export const getLookupRelatedRecords = ({
  records,
  columnDescriptorByRecordFieldId,
}: {
  records: ObjectRecord[];
  columnDescriptorByRecordFieldId: Record<
    string,
    {
      lookupTarget:
        | Pick<RecordFieldLookupTarget, 'relationFieldName'>
        | undefined;
    }
  >;
}): ObjectRecord[] =>
  Object.values(columnDescriptorByRecordFieldId).flatMap(({ lookupTarget }) => {
    if (!isDefined(lookupTarget)) {
      return [];
    }

    return records
      .map(
        (record): ObjectRecord | null | undefined =>
          record[lookupTarget.relationFieldName],
      )
      .filter((relatedRecord): relatedRecord is ObjectRecord =>
        isDefined(relatedRecord?.id),
      );
  });
