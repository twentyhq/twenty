import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getEdgeTypename } from 'twenty-shared/utils';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { type RecordGqlEdge } from '@/object-record/graphql/types/RecordGqlEdge';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const getRecordEdgeFromRecord = <T extends ObjectRecord>({
  objectMetadataItems,
  objectMetadataItem,
  recordGqlFields,
  record,
  computeReferences = false,
  isRootLevel = false,
}: {
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'fields' | 'namePlural' | 'nameSingular'
  >;
  recordGqlFields?: Record<string, any>;
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
        recordGqlFields,
        record,
        computeReferences,
        isRootLevel,
      }),
    },
    cursor: '',
  } as RecordGqlEdge;
};
