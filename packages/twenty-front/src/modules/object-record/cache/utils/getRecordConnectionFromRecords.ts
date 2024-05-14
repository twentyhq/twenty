import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getConnectionTypename } from '@/object-record/cache/utils/getConnectionTypename';
import { getEmptyPageInfo } from '@/object-record/cache/utils/getEmptyPageInfo';
import { getRecordEdgeFromRecord } from '@/object-record/cache/utils/getRecordEdgeFromRecord';
import { RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';
import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const getRecordConnectionFromRecords = <T extends ObjectRecord>({
  objectMetadataItems,
  objectMetadataItem,
  records,
  recordGqlFields,
  withPageInfo = true,
  computeReferences = false,
  isRootLevel = true,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    'fields' | 'namePlural' | 'nameSingular'
  >;
  records: T[];
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
  withPageInfo?: boolean;
  isRootLevel?: boolean;
  computeReferences?: boolean;
}) => {
  return {
    __typename: getConnectionTypename(objectMetadataItem.nameSingular),
    edges: records.map((record) => {
      return getRecordEdgeFromRecord({
        objectMetadataItems,
        objectMetadataItem,
        recordGqlFields,
        record,
        isRootLevel,
        computeReferences,
      });
    }),
    ...(withPageInfo && { pageInfo: getEmptyPageInfo() }),
    ...(withPageInfo && { totalCount: records.length }),
  } as RecordGqlConnection;
};
