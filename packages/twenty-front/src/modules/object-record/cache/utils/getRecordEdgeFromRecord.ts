import { getEdgeTypename } from '@/object-record/cache/utils/getEdgeTypename';
import { getNodeTypename } from '@/object-record/cache/utils/getNodeTypename';
import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordEdge } from '@/object-record/types/ObjectRecordEdge';

export const getRecordEdgeFromRecord = <T extends ObjectRecord>({
  objectNameSingular,
  record,
}: {
  objectNameSingular: string;
  record: T;
}) => {
  const nestedRecord = Object.fromEntries(
    Object.entries(record).map(([key, value]) => {
      // If value is an array
      if (Array.isArray(value)) {
        return [
          key,
          getRecordConnectionFromRecords({
            objectNameSingular: key,
            records: value as ObjectRecord[],
          }),
        ];
      }
      return [key, value];
    }),
  ) as T; // Todo fix typing

  return {
    __typename: getEdgeTypename({ objectNameSingular }),
    node: {
      __typename: getNodeTypename({ objectNameSingular }),
      ...nestedRecord,
    },
    cursor: '',
  } as ObjectRecordEdge<T>;
};
