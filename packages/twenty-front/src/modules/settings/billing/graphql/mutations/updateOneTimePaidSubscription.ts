import { gql } from '@apollo/client';

export const UPDATE_ONE_TIME_PAID_SUBSCRIPTION = gql`
  mutation UpdateOneTimePaidSubscription {
    updateOneTimePaidSubscription {
      bankSlipFileLink
    }
  }
`;
