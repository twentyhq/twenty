import { gql } from '@apollo/client';

export const WORKSPACE_MEMBER_FIELDS_FRAGMENT = gql`
  fragment workspaceMemberFieldsFragment on WorkspaceMember {
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
`;
