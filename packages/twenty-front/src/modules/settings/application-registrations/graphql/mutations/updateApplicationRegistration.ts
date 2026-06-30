import { gql } from '@apollo/client';

import { APPLICATION_REGISTRATION_FRAGMENT } from '@/settings/application-registrations/graphql/fragments/applicationRegistrationFragment';

export const UPDATE_APPLICATION_REGISTRATION = gql`
  mutation UpdateApplicationRegistration(
    $input: UpdateApplicationRegistrationInput!
  ) {
    updateApplicationRegistration(input: $input) {
      ...ApplicationRegistrationFragment
    }
  }
  ${APPLICATION_REGISTRATION_FRAGMENT}
`;
