import gql from 'graphql-tag';

// Flips the CALLER's own lead-routing presence. A plain workspaceMember update
// cannot be used: Twenty gates that behind the WORKSPACE_MEMBERS settings flag,
// which would also let a sales manager edit and delete colleagues. This
// mutation resolves the member from the auth context, so it is exactly one row
// wide.
export const ENSO_SET_MY_ROUTING_AVAILABILITY = gql`
  mutation EnsoSetMyRoutingAvailability($isAvailableForRouting: Boolean!) {
    ensoSetMyRoutingAvailability(
      isAvailableForRouting: $isAvailableForRouting
    ) {
      isAvailableForRouting
    }
  }
`;
