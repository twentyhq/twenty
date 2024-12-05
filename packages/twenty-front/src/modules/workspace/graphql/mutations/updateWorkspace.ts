import { gql } from '@apollo/client';

export const UPDATE_WORKSPACE = gql`
  mutation UpdateWorkspace($input: UpdateWorkspaceInput!) {
    updateWorkspace(data: $input) {
      id
      domainName
      subdomain
      displayName
      logo
      allowImpersonation
      isPublicInviteLinkEnabled
      isGoogleAuthEnabled
      isMicrosoftAuthEnabled
      isPasswordAuthEnabled
    }
  }
`;
