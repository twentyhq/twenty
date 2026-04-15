import { gql } from '@apollo/client';

import { APPLICATION_REGISTRATION_FRAGMENT } from '@/settings/application-registrations/graphql/fragments/applicationRegistrationFragment';

export const FIND_ONE_ADMIN_APPLICATION_REGISTRATION = gql`
  query FindOneAdminApplicationRegistration($id: String!) {
    findOneAdminApplicationRegistration(id: $id) {
      ...ApplicationRegistrationFragment
    }
  }
  ${APPLICATION_REGISTRATION_FRAGMENT}
`;
