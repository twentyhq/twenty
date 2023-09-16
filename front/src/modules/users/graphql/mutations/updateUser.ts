import { gql } from '@apollo/client';

export const UPDATE_USER = gql`
  mutation UpdateUser($data: UserUpdateInput!, $where: UserWhereUniqueInput!) {
    updateUser(data: $data, where: $where) {
      id
      email
      displayName
      firstName
      lastName
      avatarUrl
      workspaceMember {
        id
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
    }
  }
`;
