import { gql } from '@apollo/client';

export const GET_SERVER_ADMINS = gql`
  query GetServerAdmins {
    getServerAdmins {
      id
      email
      firstName
      lastName
      canAccessFullAdminPanel
      canImpersonate
    }
  }
`;
