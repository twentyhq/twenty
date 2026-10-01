import gql from 'graphql-tag';

export const GRANT_APPLICATION_CAPABILITIES = gql`
  mutation GrantApplicationCapabilities(
    $input: GrantApplicationCapabilitiesInput!
  ) {
    grantApplicationCapabilities(input: $input) {
      id
      grantedCapabilities
    }
  }
`;
