import { gql } from '@apollo/client';

export const UPDATE_WORKSPACE_MEMBER = gql`
  mutation UpdateWorkspaceMember(
    $data: WorkspaceMemberUpdateInput!
    $where: WorkspaceMemberWhereUniqueInput!
  ) {
    updateWorkspaceMember(data: $data, where: $where) {
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
