import { getConnectionTypename } from '@/object-record/cache/utils/getConnectionTypename';
import { getEmptyPageInfo } from '@/object-record/cache/utils/getEmptyPageInfo';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { ObjectRecordEdge } from '@/object-record/types/ObjectRecordEdge';

export const getRecordConnectionFromEdges = <T extends ObjectRecord>({
  objectNameSingular,
  edges,
}: {
  objectNameSingular: string;
  edges: ObjectRecordEdge<T>[];
}) => {
  return {
    __typename: getConnectionTypename({ objectNameSingular }),
    edges: edges,
    pageInfo: getEmptyPageInfo(),
  } as ObjectRecordConnection<T>;
};
