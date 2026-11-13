import gql from 'graphql-tag';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { FIND_SCOPED_RELATION_RECORDS_OPERATION_NAME } from '@/object-record/record-column-scope/constants/FindScopedRelationRecordsOperationName';
import { buildIdentifierGqlFields } from '@/object-record/graphql/record-gql-fields/utils/buildIdentifierGqlFields';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

export const generateFindScopedRelationRecordsQuery = ({
  objectMetadataItem,
  relationFieldName,
  relationObjectMetadataItem,
  objectMetadataItems,
  objectPermissionsByObjectMetadataId,
}: {
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'nameSingular' | 'namePlural'
  >;
  relationFieldName: string;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectPermissionsByObjectMetadataId: Record<string, ObjectRecordsPermissions>;
}) => gql`
query ${FIND_SCOPED_RELATION_RECORDS_OPERATION_NAME}($filter: ${capitalize(
  objectMetadataItem.nameSingular,
)}FilterInput, $limit: Int, $relationFilter: ${capitalize(
  relationObjectMetadataItem.nameSingular,
)}FilterInput, $relationOrderBy: [${capitalize(
  relationObjectMetadataItem.nameSingular,
)}OrderByInput], $relationLimit: Int) {
  ${objectMetadataItem.namePlural}(filter: $filter, first: $limit) {
    edges {
      node {
        id
        ${relationFieldName}(filter: $relationFilter, orderBy: $relationOrderBy, first: $relationLimit) {
          edges {
            node ${mapObjectMetadataToGraphQLQuery({
              objectMetadataItems,
              objectMetadataItem: relationObjectMetadataItem,
              recordGqlFields: buildIdentifierGqlFields(
                relationObjectMetadataItem,
              ),
              isRootLevel: false,
              objectPermissionsByObjectMetadataId,
            })}
          }
        }
      }
    }
  }
}
`;
