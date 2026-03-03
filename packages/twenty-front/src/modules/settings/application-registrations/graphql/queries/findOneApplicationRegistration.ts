import { gql } from '@apollo/client';

import { APPLICATION_REGISTRATION_FRAGMENT } from '@/settings/application-registrations/graphql/fragments/applicationRegistrationFragment';

export const FIND_ONE_APPLICATION_REGISTRATION = gql`
  query FindOneApplicationRegistration($id: String!) {
    findOneApplicationRegistration(id: $id) {
      ...ApplicationRegistrationFragment
    }
  }
  ${APPLICATION_REGISTRATION_FRAGMENT}
`;
