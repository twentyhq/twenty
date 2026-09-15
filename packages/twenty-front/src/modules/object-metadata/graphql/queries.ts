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

export const OBJECT_RECORD_COUNTS = gql`
  query ObjectRecordCounts {
    objectRecordCounts {
      objectNamePlural
      totalCount
    }
  }
`;

export const MOSTLY_EMPTY_FIELD_METADATA_IDS = gql`
  query MostlyEmptyFieldMetadataIds($objectMetadataId: UUID!) {
    mostlyEmptyFieldMetadataIds(objectMetadataId: $objectMetadataId)
  }
`;
