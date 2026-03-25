import { gql } from '@apollo/client';

import { APPLICATION_REGISTRATION_FRAGMENT } from '@/settings/application-registrations/graphql/fragments/applicationRegistrationFragment';

export const FIND_ALL_APPLICATION_REGISTRATIONS = gql`
  query FindAllApplicationRegistrations {
    findAllApplicationRegistrations {
      ...ApplicationRegistrationFragment
    }
  }
  ${APPLICATION_REGISTRATION_FRAGMENT}
`;
