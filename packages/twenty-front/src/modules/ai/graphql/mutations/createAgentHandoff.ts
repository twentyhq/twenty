import { gql } from '@apollo/client';

export const CREATE_AGENT_HANDOFF = gql`
  mutation CreateAgentHandoff($input: CreateAgentHandoffInput!) {
    createAgentHandoff(input: $input)
  }
`;
