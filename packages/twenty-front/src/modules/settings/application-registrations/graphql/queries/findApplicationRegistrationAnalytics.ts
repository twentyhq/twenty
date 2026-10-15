import { gql } from '@apollo/client';

import { APPLICATION_REGISTRATION_ANALYTICS_FRAGMENT } from '@/applications/graphql/fragments/applicationRegistrationAnalyticsFragment';

export const FIND_APPLICATION_REGISTRATION_ANALYTICS = gql`
  ${APPLICATION_REGISTRATION_ANALYTICS_FRAGMENT}
  query FindApplicationRegistrationAnalytics(
    $input: ApplicationRegistrationAnalyticsInput!
  ) {
    findApplicationRegistrationAnalytics(input: $input) {
      ...ApplicationRegistrationAnalyticsFragment
    }
  }
`;
