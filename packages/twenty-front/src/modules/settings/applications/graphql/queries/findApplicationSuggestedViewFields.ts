import { gql } from '@apollo/client';

export const FIND_APPLICATION_SUGGESTED_VIEW_FIELDS = gql`
  query FindApplicationSuggestedViewFields($applicationId: UUID!) {
    applicationSuggestedViewFields(applicationId: $applicationId) {
      universalIdentifier
      viewId
      objectMetadataId
      fieldMetadataId
      position
    }
  }
`;
