import gql from 'graphql-tag';

export const FIND_FRONT_COMPONENT_APPLICATION_CAPABILITIES = gql`
  query FindFrontComponentApplicationCapabilities($id: UUID!) {
    frontComponent(id: $id) {
      id
      applicationGrantedCapabilities
    }
  }
`;
