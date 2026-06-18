import { gql } from '@apollo/client';

export const ACTIVATE_WORKSPACE = gql`
  mutation ActivateWorkspace {
    activateWorkspace {
      id
    }
  }
`;
