import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordEdge } from '@/object-record/types/ObjectRecordEdge';
import { getEdgeTypename } from '@/object-record/utils/getEdgeTypename';
import { getNodeTypename } from '@/object-record/utils/getNodeTypename';

export const getRecordEdgeFromRecord = <T extends ObjectRecord>({
  objectNameSingular,
  record,
}: {
  objectNameSingular: string;
  record: T;
}) => {
  return {
    __typename: getEdgeTypename({ objectNameSingular }),
    node: {
      __typename: getNodeTypename({ objectNameSingular }),
      ...record,
    },
    cursor: '',
  } as ObjectRecordEdge<T>;
};
