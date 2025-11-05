import { gql } from '@apollo/client';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { type RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { type ObjectPermissions } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

export const generateGroupByRecordsQuery = ({
  objectMetadataItem,
  objectMetadataItems,
  recordGqlFields,
  computeReferences,
  objectPermissionsByObjectMetadataId,
}: {
  objectMetadataItem: ObjectMetadataItem;
  objectMetadataItems: ObjectMetadataItem[];
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
  computeReferences?: boolean;
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
}) => gql`
query GroupBy${capitalize(
  objectMetadataItem.namePlural,
)}($groupBy: [${capitalize(
  objectMetadataItem.nameSingular,
)}GroupByInput!]!, $filter: ${capitalize(
  objectMetadataItem.nameSingular,
)}FilterInput, $orderBy: [${capitalize(
  objectMetadataItem.nameSingular,
)}OrderByWithGroupByInput!], $orderByForRecords: [${capitalize(
  objectMetadataItem.nameSingular,
)}OrderByInput], $viewId: UUID) {
  ${objectMetadataItem.namePlural}GroupBy(
    groupBy: $groupBy
    filter: $filter
    orderBy: $orderBy
    orderByForRecords: $orderByForRecords
    viewId: $viewId
  ) {
    edges {
      node ${mapObjectMetadataToGraphQLQuery({
        objectMetadataItems,
        objectMetadataItem,
        recordGqlFields,
        computeReferences,
        objectPermissionsByObjectMetadataId,
      })}
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
    groupByDimensionValues
  }
}
`;
