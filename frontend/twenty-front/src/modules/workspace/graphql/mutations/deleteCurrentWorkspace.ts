import { gql } from '@apollo/client';

export const DELETE_CURRENT_WORKSPACE = gql`
  mutation DeleteCurrentWorkspace {
    deleteCurrentWorkspace {
      id
    }
  }
`;
