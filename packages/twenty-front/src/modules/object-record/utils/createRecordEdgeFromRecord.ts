import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordEdge } from '@/object-record/types/ObjectRecordEdge';
import { capitalize } from '~/utils/string/capitalize';

export const createRecordEdgeFromRecord = <T extends ObjectRecord>({
  objectNameSingular,
  record,
}: {
  objectNameSingular: string;
  record: T;
}) => {
  return {
    __typename: `${capitalize(objectNameSingular)}Edge`,
    node: {
      __typename: capitalize(objectNameSingular),
      ...record,
    },
    cursor: '',
  } as ObjectRecordEdge<T>;
};
