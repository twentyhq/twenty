import { gql } from '@apollo/client';

export const GET_CONDITIONAL_AVAILABILITY_ROLES = gql`
  query GetConditionalAvailabilityRoles {
    getRoles {
      id
      label
      icon
      universalIdentifier
      canBeAssignedToUsers
    }
  }
`;
