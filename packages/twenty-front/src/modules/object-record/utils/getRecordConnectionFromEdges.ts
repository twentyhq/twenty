import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { ObjectRecordEdge } from '@/object-record/types/ObjectRecordEdge';
import { getConnectionTypename } from '@/object-record/utils/getConnectionTypename';
import { getEmptyPageInfo } from '@/object-record/utils/getEmptyPageInfo';

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
