import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getConnectionTypename } from '@/object-record/cache/utils/getConnectionTypename';
import { getEmptyPageInfo } from '@/object-record/cache/utils/getEmptyPageInfo';
import { getRecordEdgeFromRecord } from '@/object-record/cache/utils/getRecordEdgeFromRecord';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';

export const getRecordConnectionFromRecords = <T extends ObjectRecord>({
  objectMetadataItems,
  objectMetadataItem,
  records,
  queryFields,
  withPageInfo = true,
  computeReferences = false,
  isRootLevel = true,
  depth = 1,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    'fields' | 'namePlural' | 'nameSingular'
  >;
  records: T[];
  queryFields?: Record<string, any>;
  withPageInfo?: boolean;
  isRootLevel?: boolean;
  computeReferences?: boolean;
  depth?: number;
}) => {
  return {
    __typename: getConnectionTypename(objectMetadataItem.nameSingular),
    edges: records.map((record) => {
      return getRecordEdgeFromRecord({
        objectMetadataItems,
        objectMetadataItem,
        queryFields,
        record,
        isRootLevel,
        computeReferences,
        depth,
      });
    }),
    ...(withPageInfo && { pageInfo: getEmptyPageInfo() }),
    ...(withPageInfo && { totalCount: records.length }),
  } as ObjectRecordConnection<T>;
};
