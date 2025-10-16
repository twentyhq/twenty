import { gql } from '@apollo/client';
import { OBJECT_METADATA_FRAGMENT } from '@/object-metadata/graphql/fragment';

export const FIND_MANY_OBJECT_METADATA_ITEMS = gql`
  ${OBJECT_METADATA_FRAGMENT}
  query ObjectMetadataItems {
    objects(paging: { first: 1000 }) {
      edges {
        node {
          ...ObjectMetadataFields
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;
