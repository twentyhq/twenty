import { gql } from '@apollo/client';

export const GET_ALL_DIALING_PLANS = gql`
  query getTelephonyPlans($workspaceId: ID!) {
    getTelephonyPlans(workspaceId: $workspaceId) {
      plano_discagem_id
      nome
      cliente_id
    }
  }
`;
