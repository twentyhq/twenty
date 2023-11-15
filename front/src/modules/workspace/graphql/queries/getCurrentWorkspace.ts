import { gql } from '@apollo/client';

export const GET_CURRENT_WORKSPACE = gql`
  query getCurrentWorkspace {
    currentWorkspace {
      id
      displayName
      logo
    }
  }
`;
