import { type CreateEdgeParams } from '@/apollo/optimistic-effect/types/OptimisticEffectSharedTypes';
import { encodeCursor } from '@/apollo/utils/encodeCursor';
import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { getEdgeTypename } from '@/object-record/cache/utils/getEdgeTypename';
import { isDefined } from 'twenty-shared/utils';

export const createCacheRef = ({
  record,
  objectMetadataItem,
  toReference,
}: CreateEdgeParams): RecordGqlRefEdge | null => {
  const reference = toReference(record);
  if (!isDefined(reference)) {
    return null;
  }

  return {
    __typename: getEdgeTypename(objectMetadataItem.nameSingular),
    node: reference,
    cursor: encodeCursor(record),
  };
};
