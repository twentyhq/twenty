import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';

export const getLookupRelatedRecords = ({
  records,
  lookupRelationFieldNames,
}: {
  records: ObjectRecord[];
  lookupRelationFieldNames: string[];
}): ObjectRecord[] =>
  records.flatMap((record) =>
    lookupRelationFieldNames.flatMap((fieldName) => {
      const relatedRecord: ObjectRecord | null | undefined = record[fieldName];

      return isDefined(relatedRecord?.id) ? [relatedRecord] : [];
    }),
  );
