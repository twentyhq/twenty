import { encodeCursor } from '@/apollo/utils/encodeCursor';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { getEdgeTypename } from '@/object-record/cache/utils/getEdgeTypename';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { type FieldFunctionOptions } from '@apollo/client/cache';

type ToReferenceFunction = FieldFunctionOptions['toReference'];
import { isDefined } from 'twenty-shared/utils';

type CreateCacheEdgeWithRecordRefParams = {
  record: RecordGqlNode;
  objectMetadataItem: EnrichedObjectMetadataItem;
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
