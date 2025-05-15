import { gql } from '@apollo/client';

export const GET_ALL_URAS = gql`
  query getTelephonyURAs($workspaceId: ID!) {
    getTelephonyURAs(workspaceId: $workspaceId) {
      campanha_id
      nome
    }
  }
`;
