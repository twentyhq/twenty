import { gql } from '@apollo/client';

export const UPDATE_SECTOR = gql`
  mutation UpdateSector($updateInput: UpdateSectorInput!) {
    updateSector(updateInput: $updateInput) {
      id
      name
      topics
      icon
      workspace {
        id
        displayName
      }
    }
  }
`;
