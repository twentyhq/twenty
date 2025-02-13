import { gql } from '@apollo/client';

export const GET_ALL_DIALING_PLANS = gql`
  query getTelephonyPlans {
    getTelephonyPlans {
      plano_discagem_id
      nome
      cliente_id
    }
  }
`;
