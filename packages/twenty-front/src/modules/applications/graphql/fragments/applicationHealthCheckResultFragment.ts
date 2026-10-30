import { gql } from '@apollo/client';

export const APPLICATION_HEALTH_CHECK_RESULT_FRAGMENT = gql`
  fragment ApplicationHealthCheckResultFields on ApplicationHealthCheckResult {
    status
    title
    description
    action {
      label
      location
    }
  }
`;
