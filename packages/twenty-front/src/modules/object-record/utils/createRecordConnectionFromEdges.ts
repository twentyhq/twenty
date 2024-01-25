import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { ObjectRecordEdge } from '@/object-record/types/ObjectRecordEdge';
import { capitalize } from '~/utils/string/capitalize';

export const createRecordConnectionFromEdges = <T extends ObjectRecord>({
  objectNameSingular,
  edges,
}: {
  objectNameSingular: string;
  edges: ObjectRecordEdge<T>[];
}) => {
  return {
    __typename: `${capitalize(objectNameSingular)}Connection`,
    edges: edges,
    pageInfo: {
      __typename: 'PageInfo',
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: '',
      endCursor: '',
    },
  } as ObjectRecordConnection<T>;
};
