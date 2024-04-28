import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getEdgeTypename } from '@/object-record/cache/utils/getEdgeTypename';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { RecordGqlEdge } from '@/object-record/graphql-operations/types/RecordGqlEdge';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const getRecordEdgeFromRecord = <T extends ObjectRecord>({
  objectMetadataItems,
  objectMetadataItem,
  operationFields,
  record,
  computeReferences = false,
  isRootLevel = false,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    'fields' | 'namePlural' | 'nameSingular'
  >;
  operationFields?: Record<string, any>;
  computeReferences?: boolean;
  isRootLevel?: boolean;
  record: T;
}) => {
  return {
    __typename: getEdgeTypename(objectMetadataItem.nameSingular),
    node: {
      ...getRecordNodeFromRecord({
        objectMetadataItems,
        objectMetadataItem,
        operationFields,
        record,
        computeReferences,
        isRootLevel,
      }),
    },
    cursor: '',
  } as RecordGqlEdge;
};
