import { gql } from '@apollo/client';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { type RecordGqlRelationAlias } from '@/object-record/graphql/types/RecordGqlRelationAlias';
import { mapRecordGqlRelationAliasesToGraphQLQuery } from '@/object-record/graphql/utils/mapRecordGqlRelationAliasesToGraphQLQuery';
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
  relationAliases,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  recordGqlFields?: RecordGqlFields;
  computeReferences?: boolean;
  objectPermissionsByObjectMetadataId: Record<string, ObjectRecordsPermissions>;
  relationAliases?: RecordGqlRelationAlias[];
}) => {
  const { variableDefinitions, selections } =
    mapRecordGqlRelationAliasesToGraphQLQuery({
      relationAliases,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
    });

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
        additionalSelections: selections,
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
