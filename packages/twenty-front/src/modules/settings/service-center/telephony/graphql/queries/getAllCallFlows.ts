import { gql } from '@apollo/client';

export const GET_ALL_CALLFLOWS = gql`
  query getTelephonyCallFlows {
    getTelephonyCallFlows {
      fluxo_chamada_id
      fluxo_chamada_nome
    }
  }
`;
