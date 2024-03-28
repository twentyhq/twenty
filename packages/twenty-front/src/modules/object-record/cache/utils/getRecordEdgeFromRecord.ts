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
      if (Array.isArray(value)) {
        return [
          key,
          getRecordConnectionFromRecords({
            // Todo: this is a ugly and broken hack to get the singular, we need to infer this from metadata
            objectNameSingular: key.slice(0, -1),
            records: value as ObjectRecord[],
          }),
        ];
      }
      return [key, value];
    }),
  ) as T; // Todo fix typing once we have investigated apollo edges / nodes removal

  return {
    __typename: getEdgeTypename({ objectNameSingular }),
    node: {
      __typename: getNodeTypename({ objectNameSingular }),
      ...nestedRecord,
    },
    cursor: '',
  } as ObjectRecordEdge<T>;
};
