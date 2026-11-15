import { gql } from '@apollo/client';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { getReadableRelationsWithArguments } from '@/object-record/graphql/utils/getReadableRelationsWithArguments';
import { getRelationsWithArgumentsVariableDefinitions } from '@/object-record/graphql/utils/getRelationsWithArgumentsVariableDefinitions';
import {
  type ObjectRecordsPermissions,
  type RecordGqlFields,
} from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

export const generateGroupByRecordsQuery = ({
  objectMetadataItem,
  objectMetadataItems,
  recordGqlFields,
  computeReferences,
  objectPermissionsByObjectMetadataId,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  recordGqlFields?: RecordGqlFields;
  computeReferences?: boolean;
  objectPermissionsByObjectMetadataId: Record<string, ObjectRecordsPermissions>;
}) => {
  const readableRelationsWithArguments = getReadableRelationsWithArguments({
    objectMetadataItem,
    objectMetadataItems,
    recordGqlFields,
    objectPermissionsByObjectMetadataId,
  });
  const variableDefinitions = getRelationsWithArgumentsVariableDefinitions(
    readableRelationsWithArguments,
  );

  return gql`
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
  )}OrderByInput], $viewId: UUID${variableDefinitions}) {
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
        readableRelationsWithArguments,
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
};
