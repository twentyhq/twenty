import gql from 'graphql-tag';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { getSearchRecordsQueryResponseField } from '@/object-record/utils/getSearchRecordsQueryResponseField';
import { capitalize } from '~/utils/string/capitalize';

export type QueryCursorDirection = 'before' | 'after';

export const generateSearchRecordsQuery = ({
  objectMetadataItem,
  objectMetadataItems,
  recordGqlFields,
  computeReferences,
  _cursorDirection,
}: {
  objectMetadataItem: ObjectMetadataItem;
  objectMetadataItems: ObjectMetadataItem[]; // TODO - what is this used for?
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
  computeReferences?: boolean;
  _cursorDirection?: QueryCursorDirection;
}) => gql`
    query Search${capitalize(objectMetadataItem.namePlural)}($search: String) {
  ${getSearchRecordsQueryResponseField(objectMetadataItem.namePlural)}(search: $search){
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
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
`;
