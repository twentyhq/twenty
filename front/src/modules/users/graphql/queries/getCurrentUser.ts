import { gql } from '@apollo/client';

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      id
      email
      displayName
      firstName
      lastName
      avatarUrl
      canImpersonate
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
        assignedActivities {
          id
          title
        }
        authoredActivities {
          id
          title
        }
        authoredAttachments {
          id
          name
          type
        }
        settings {
          id
          colorScheme
          locale
        }
        companies {
          id
          name
          domainName
        }
        comments {
          id
          body
        }
      }
      settings {
        id
        locale
        colorScheme
      }
      supportUserHash
    }
  }
`;
