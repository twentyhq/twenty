import { gql } from '@apollo/client';

export const GET_ALL_DIDS = gql`
  query getTelephonyDids($workspaceId: ID!) {
    getTelephonyDids(workspaceId: $workspaceId) {
      did_id
      numero
    }
  }
`;
