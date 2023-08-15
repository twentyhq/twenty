import { gql } from '@apollo/client';

export const USER_QUERY_FRAGMENT = gql`
  fragment UserQueryFragment on User {
    id
    email
    displayName
    firstName
    lastName
    canImpersonate
    supportUserHash
    workspaceMember {
      id
      allowImpersonation
      workspace {
        id
        domainName
        displayName
        logo
        inviteHash
      }
    }
    settings {
      id
      colorScheme
      locale
    }
  }
`;
