import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getEdgeTypename } from '@/object-record/cache/utils/getEdgeTypename';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordEdge } from '@/object-record/types/ObjectRecordEdge';

export const getRecordEdgeFromRecord = <T extends ObjectRecord>({
  objectMetadataItems,
  objectMetadataItem,
  queryFields,
  record,
  computeReferences = false,
  isRootLevel = false,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    'fields' | 'namePlural' | 'nameSingular'
  >;
  queryFields?: Record<string, any>;
  computeReferences?: boolean;
  isRootLevel?: boolean;
  depth?: number;
  record: T;
}) => {
  return {
    __typename: getEdgeTypename(objectMetadataItem.nameSingular),
    node: {
      ...getRecordNodeFromRecord({
        objectMetadataItems,
        objectMetadataItem,
        queryFields,
        record,
        computeReferences,
        isRootLevel,
        depth: 1,
      }),
    },
    cursor: '',
  } as ObjectRecordEdge<T>;
};
