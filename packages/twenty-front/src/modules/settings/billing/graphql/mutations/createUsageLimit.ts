import { gql } from '@apollo/client';

export const CREATE_USAGE_LIMIT = gql`
  mutation CreateUsageLimit($input: CreateUsageLimitInput!) {
    createUsageLimit(input: $input) {
      id
    }
  }
`;
