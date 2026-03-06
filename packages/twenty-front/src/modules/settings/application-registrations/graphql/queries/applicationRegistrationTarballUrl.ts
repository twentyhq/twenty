import { gql } from '@apollo/client';

export const APPLICATION_REGISTRATION_TARBALL_URL = gql`
  query ApplicationRegistrationTarballUrl($id: String!) {
    applicationRegistrationTarballUrl(id: $id)
  }
`;
