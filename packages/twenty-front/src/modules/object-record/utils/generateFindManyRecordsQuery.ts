import gql from 'graphql-tag';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { type RecordGqlRelationAlias } from '@/object-record/graphql/types/RecordGqlRelationAlias';
import { mapRecordGqlRelationAliasesToGraphQLQuery } from '@/object-record/graphql/utils/mapRecordGqlRelationAliasesToGraphQLQuery';
import {
  type ObjectRecordsPermissions,
  type QueryCursorDirection,
  type RecordGqlFields,
} from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

export const generateFindManyRecordsQuery = ({
  objectMetadataItem,
  objectMetadataItems,
  recordGqlFields,
  computeReferences,
  cursorDirection,
  objectPermissionsByObjectMetadataId,
  relationAliases,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  recordGqlFields?: RecordGqlFields;
  computeReferences?: boolean;
  cursorDirection?: QueryCursorDirection;
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
query FindMany${capitalize(
    objectMetadataItem.namePlural,
  )}($filter: ${capitalize(
    objectMetadataItem.nameSingular,
  )}FilterInput, $orderBy: [${capitalize(
    objectMetadataItem.nameSingular,
  )}OrderByInput], $lastCursor: String, $limit: Int, $offset: Int${variableDefinitions}) {
  ${objectMetadataItem.namePlural}(filter: $filter, orderBy: $orderBy, ${
    cursorDirection === 'before'
      ? 'last: $limit, before: $lastCursor'
      : 'first: $limit, after: $lastCursor'
  }, offset: $offset){
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
  }
}
`;
};
