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
}): ObjectRecord[] => {
  const relationFieldNames = new Set(
    Object.values(columnDescriptorByRecordFieldId).flatMap(
      ({ lookupTarget }) =>
        isDefined(lookupTarget) ? [lookupTarget.relationFieldName] : [],
    ),
  );

  const relatedRecordById = new Map<string, ObjectRecord>();

  for (const relationFieldName of relationFieldNames) {
    for (const record of records) {
      const relatedRecord: ObjectRecord | null | undefined =
        record[relationFieldName];

      if (!isDefined(relatedRecord?.id)) {
        continue;
      }

      // Two relations can reach one record with different selected fields
      relatedRecordById.set(relatedRecord.id, {
        ...relatedRecordById.get(relatedRecord.id),
        ...relatedRecord,
      });
    }
  }

  return [...relatedRecordById.values()];
};
