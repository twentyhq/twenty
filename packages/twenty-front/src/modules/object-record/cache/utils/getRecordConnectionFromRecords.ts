import { getConnectionTypename } from '@/object-record/cache/utils/getConnectionTypename';
import { getEmptyPageInfo } from '@/object-record/cache/utils/getEmptyPageInfo';
import { getRecordEdgeFromRecord } from '@/object-record/cache/utils/getRecordEdgeFromRecord';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';

export const getRecordConnectionFromRecords = <T extends ObjectRecord>({
  objectNameSingular,
  records,
}: {
  objectNameSingular: string;
  records: T[];
}) => {
  return {
    __typename: getConnectionTypename({ objectNameSingular }),
    edges: records.map((record) => {
      return getRecordEdgeFromRecord({
        objectNameSingular,
        record,
      });
    }),
    pageInfo: getEmptyPageInfo(),
  } as ObjectRecordConnection<T>;
};
