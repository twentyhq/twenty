import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { getConnectionTypename } from '@/object-record/utils/getConnectionTypename';
import { getEmptyPageInfo } from '@/object-record/utils/getEmptyPageInfo';
import { getRecordEdgeFromRecord } from '@/object-record/utils/getRecordEdgeFromRecord';

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
