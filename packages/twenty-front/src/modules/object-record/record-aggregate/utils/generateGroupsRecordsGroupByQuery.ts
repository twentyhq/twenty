import gql from 'graphql-tag';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { type RecordGqlRelationAlias } from '@/object-record/graphql/types/RecordGqlRelationAlias';
import { mapRecordGqlRelationAliasesToGraphQLQuery } from '@/object-record/graphql/utils/mapRecordGqlRelationAliasesToGraphQLQuery';
import { getGroupByQueryResultGqlFieldName } from '@/page-layout/utils/getGroupByQueryResultGqlFieldName';
import {
  type ObjectRecordsPermissions,
  type RecordGqlFields,
} from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

export const generateGroupsRecordsGroupByQuery = ({
  objectMetadataItems,
  objectMetadataItem,
  recordGqlFields,
  computeReferences,
  objectPermissionsByObjectMetadataId,
  relationAliases,
}: {
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordGqlFields: RecordGqlFields;
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
  const capitalizedSingular = capitalize(objectMetadataItem.nameSingular);
  const queryName = `${capitalize(objectMetadataItem.namePlural)}GroupByRecords`;
  const queryFieldName = getGroupByQueryResultGqlFieldName(objectMetadataItem);

  return gql`
    query ${queryName}(
      $groupBy: [${capitalizedSingular}GroupByInput!]!
      $filter: ${capitalizedSingular}FilterInput
      $orderByForRecords: [${capitalizedSingular}OrderByInput!]
      $limit: Int
      $offsetForRecords: Int${variableDefinitions}
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
            additionalSelections: selections,
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
