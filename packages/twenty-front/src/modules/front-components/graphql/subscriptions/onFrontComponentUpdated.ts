import { gql } from '@apollo/client';

export const ON_FRONT_COMPONENT_UPDATED = gql`
  subscription OnFrontComponentUpdated($input: OnFrontComponentUpdatedInput!) {
    onFrontComponentUpdated(input: $input) {
      id
      builtComponentChecksum
      updatedAt
    }
  }
`;
