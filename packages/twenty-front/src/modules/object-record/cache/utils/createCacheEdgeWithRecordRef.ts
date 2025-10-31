import { encodeCursor } from '@/apollo/utils/encodeCursor';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { getEdgeTypename } from '@/object-record/cache/utils/getEdgeTypename';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { type ToReferenceFunction } from '@apollo/client/cache/core/types/common';
import { isDefined } from 'twenty-shared/utils';

type CreateCacheEdgeWithRecordRefParams = {
  record: RecordGqlNode;
  objectMetadataItem: ObjectMetadataItem;
  toReference: ToReferenceFunction;
};

export const createCacheEdgeWithRecordRef = ({
  record,
  objectMetadataItem,
  toReference,
}: CreateCacheEdgeWithRecordRefParams): RecordGqlRefEdge | null => {
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
