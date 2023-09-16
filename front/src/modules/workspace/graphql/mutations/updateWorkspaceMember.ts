import { gql } from '@apollo/client';

export const UPDATE_WORKSPACE_MEMBER = gql`
  mutation UpdateOneWorkspaceMember(
    $data: WorkspaceMemberUpdateInput!
    $where: WorkspaceMemberWhereUniqueInput!
  ) {
    UpdateOneWorkspaceMember(data: $data, where: $where) {
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
  }
`;
