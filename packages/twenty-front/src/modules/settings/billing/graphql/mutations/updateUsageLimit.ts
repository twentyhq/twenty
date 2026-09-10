import { gql } from '@apollo/client';

export const UPDATE_USAGE_LIMIT = gql`
  mutation UpdateUsageLimit($input: UpdateUsageLimitInput!) {
    updateUsageLimit(input: $input) {
      id
    }
  }
`;
