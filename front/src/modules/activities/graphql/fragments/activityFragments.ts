import { gql } from '@apollo/client';

export const ACTIVITY_WITH_TARGETS = gql`
  fragment ActivityWithTargets on Activity {
    id
    createdAt
    updatedAt
    activityTargets {
      id
      createdAt
      updatedAt
      companyId
      personId
    }
  }
`;
