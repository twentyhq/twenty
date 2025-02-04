import { gql } from '@apollo/client';

export const CREATE_TELEPHONY = gql`
  mutation CreateTelephony($createTelephonyInput: CreateTelephonyInput!) {
    createTelephony(createTelephonyInput: $createTelephonyInput) {
      id
    }
  }
`;
