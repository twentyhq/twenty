import { gql } from '@apollo/client';

export const AI_INTERACTION_STATES = gql`
  query AiInteractionStates($input: AiInteractionStatesInput!) {
    aiInteractionStates(input: $input) {
      actions {
        requestedId
        isAvailable
        action
      }
    }
  }
`;
