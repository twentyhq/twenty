import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { createRecordEdgeFromRecord } from '@/object-record/utils/createRecordEdgeFromRecord';
import { capitalize } from '~/utils/string/capitalize';

export const createRecordConnectionFromRecords = <T extends ObjectRecord>({
  objectNameSingular,
  records,
}: {
  objectNameSingular: string;
  records: T[];
}) => {
  return {
    __typename: `${capitalize(objectNameSingular)}Connection`,
    edges: records.map((record) => {
      return createRecordEdgeFromRecord({
        objectNameSingular,
        record,
      });
    }),
    pageInfo: {
      __typename: 'PageInfo',
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: '',
      endCursor: '',
    },
  } as ObjectRecordConnection<T>;
};
