import { gql } from '@apollo/client';

export const REMOVE_AGENT_HANDOFF = gql`
  mutation RemoveAgentHandoff($input: RemoveAgentHandoffInput!) {
    removeAgentHandoff(input: $input)
  }
`;
