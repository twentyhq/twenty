import { gql } from '@apollo/client';

export const UPDATE_TELEPHONY = gql`
  mutation UpdateTelephony(
    $id: ID!
    $updateTelephonyInput: UpdateTelephonyInput!
  ) {
    updateTelephony(id: $id, updateTelephonyInput: $updateTelephonyInput) {
      id
      memberId
      numberExtension
    }
  }
`;
