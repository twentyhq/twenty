import { gql } from '@apollo/client';

import { APPLICATION_REGISTRATION_FRAGMENT } from '@/settings/application-registrations/graphql/fragments/applicationRegistrationFragment';

export const FIND_MANY_APPLICATION_REGISTRATIONS = gql`
  query FindManyApplicationRegistrations {
    findManyApplicationRegistrations {
      ...ApplicationRegistrationFragment
    }
  }
  ${APPLICATION_REGISTRATION_FRAGMENT}
`;
