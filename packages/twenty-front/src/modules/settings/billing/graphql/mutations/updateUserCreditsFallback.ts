import { gql } from '@apollo/client';

export const UPDATE_USER_CREDITS_FALLBACK = gql`
  mutation UpdateUserCreditsFallback(
    $userCreditsFallback: UserCreditsFallback!
  ) {
    updateUserCreditsFallback(userCreditsFallback: $userCreditsFallback) {
      id
      userCreditsFallback
    }
  }
`;
