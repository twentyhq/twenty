import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getConnectionTypename } from '@/object-record/cache/utils/getConnectionTypename';
import { getEmptyPageInfo } from '@/object-record/cache/utils/getEmptyPageInfo';
import { getRecordEdgeFromRecord } from '@/object-record/cache/utils/getRecordEdgeFromRecord';
import { RecordGqlConnection } from '@/object-record/graphql-operations/types/RecordGqlConnection';
import { RecordGqlOperationFields } from '@/object-record/graphql-operations/types/RecordGqlOperationFields';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const getRecordConnectionFromRecords = <T extends ObjectRecord>({
  objectMetadataItems,
  objectMetadataItem,
  records,
  operationFields,
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
  operationFields?: RecordGqlOperationFields;
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
        operationFields,
        record,
        isRootLevel,
        computeReferences,
      });
    }),
    ...(withPageInfo && { pageInfo: getEmptyPageInfo() }),
    ...(withPageInfo && { totalCount: records.length }),
  } as RecordGqlConnection;
};
