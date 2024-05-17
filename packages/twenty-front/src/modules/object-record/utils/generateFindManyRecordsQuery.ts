import gql from 'graphql-tag';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { capitalize } from '~/utils/string/capitalize';

export const generateFindManyRecordsQuery = ({
  objectMetadataItem,
  objectMetadataItems,
  recordGqlFields,
  computeReferences,
}: {
  objectMetadataItem: ObjectMetadataItem;
  objectMetadataItems: ObjectMetadataItem[];
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
  computeReferences?: boolean;
}) => {
  const shouldQueryCounts = !objectMetadataItem.isRemote;

  return gql`
query FindMany${capitalize(
    objectMetadataItem.namePlural,
  )}($filter: ${capitalize(
    objectMetadataItem.nameSingular,
  )}FilterInput, $orderBy: ${capitalize(
    objectMetadataItem.nameSingular,
  )}OrderByInput, $lastCursor: String, $limit: Int) {
  ${
    objectMetadataItem.namePlural
  }(filter: $filter, orderBy: $orderBy, first: $limit, after: $lastCursor){
    edges {
      node ${mapObjectMetadataToGraphQLQuery({
        objectMetadataItems,
        objectMetadataItem,
        recordGqlFields,
        computeReferences,
      })}
      cursor
    }
    pageInfo {
      ${shouldQueryCounts ? 'hasNextPage' : ''}
      startCursor
      endCursor
    }
    ${shouldQueryCounts ? 'totalCount' : ''}
  }
}
`;
};
