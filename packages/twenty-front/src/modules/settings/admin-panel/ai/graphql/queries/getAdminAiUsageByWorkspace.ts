import { gql } from '@apollo/client';

export const GET_ADMIN_AI_USAGE_BY_WORKSPACE = gql`
  query GetAdminAiUsageByWorkspace(
    $periodStart: DateTime
    $periodEnd: DateTime
  ) {
    getAdminAiUsageByWorkspace(
      periodStart: $periodStart
      periodEnd: $periodEnd
    ) {
      key
      label
      creditsUsed
    }
  }
`;
