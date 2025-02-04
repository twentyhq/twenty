import { gql } from '@apollo/client';

export const UPDATE_AGENT = gql`
  mutation UpdateAgent($updateInput: UpdateAgentInput!) {
    updateAgent(updateInput: $updateInput) {
      id
      isAdmin
      isActive
      workspace {
        id
        displayName
      }
    }
  }
`;
