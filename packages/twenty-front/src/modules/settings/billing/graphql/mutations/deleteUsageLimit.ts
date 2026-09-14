import { gql } from '@apollo/client';

export const DELETE_USAGE_LIMIT = gql`
  mutation DeleteUsageLimit($usageLimitId: UUID!) {
    deleteUsageLimit(usageLimitId: $usageLimitId)
  }
`;
