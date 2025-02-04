import { gql } from '@apollo/client';

export const GET_ALL_URAS = gql`
  query getTelephonyURAs {
    getTelephonyURAs {
      campanha_id
      nome
    }
  }
`;
