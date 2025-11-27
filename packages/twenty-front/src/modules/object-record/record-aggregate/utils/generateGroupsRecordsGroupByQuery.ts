import gql from 'graphql-tag';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { type RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { getGroupByQueryResultGqlFieldName } from '@/page-layout/utils/getGroupByQueryResultGqlFieldName';
import { type ObjectPermissions } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

export const generateGroupsRecordsGroupByQuery = ({
  objectMetadataItems,
  objectMetadataItem,
  recordGqlFields,
  computeReferences,
  objectPermissionsByObjectMetadataId,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: ObjectMetadataItem;
  recordGqlFields: RecordGqlOperationGqlRecordFields;
  computeReferences?: boolean;
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
}) => {
  const capitalizedSingular = capitalize(objectMetadataItem.nameSingular);
  const queryName = `${capitalize(objectMetadataItem.namePlural)}GroupByRecords`;
  const queryFieldName = getGroupByQueryResultGqlFieldName(objectMetadataItem);

  return gql`
    query ${queryName}(
      $groupBy: [${capitalizedSingular}GroupByInput!]!
      $filter: ${capitalizedSingular}FilterInput
      $orderByForRecords: [${capitalizedSingular}OrderByInput!]
      $limit: Int
      $offsetForRecords: Int
    ) {
      ${queryFieldName}(
        groupBy: $groupBy
        filter: $filter
        orderByForRecords: $orderByForRecords
        limit: $limit
        offsetForRecords: $offsetForRecords
      ) {
        groupByDimensionValues
        edges {
          node ${mapObjectMetadataToGraphQLQuery({
            objectMetadataItems,
            objectMetadataItem,
            recordGqlFields,
            computeReferences,
            objectPermissionsByObjectMetadataId,
          })}
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  `;
};
