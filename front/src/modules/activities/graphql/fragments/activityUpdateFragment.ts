import { gql } from '@apollo/client';

export const ACTIVITY_UPDATE_FRAGMENT = gql`
  fragment ActivityUpdateParts on Activity {
    id
    body
    title
    type
    completedAt
    dueAt
    assignee {
      id
      firstName
      lastName
      displayName
    }
  }
`;
