import { gql } from '@apollo/client';

export const GET_ALL_DIDS = gql`
  query getTelephonyDids {
    getTelephonyDids {
      did_id
      numero
    }
  }
`;
