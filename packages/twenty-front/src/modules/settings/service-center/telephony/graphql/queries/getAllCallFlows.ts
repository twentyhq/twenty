import { gql } from '@apollo/client';

export const GET_ALL_CALLFLOWS = gql`
  query getTelephonyCallFlows($workspaceId: ID!) {
    getTelephonyCallFlows(workspaceId: $workspaceId) {
      fluxo_chamada_id
      fluxo_chamada_nome
    }
  }
`;
