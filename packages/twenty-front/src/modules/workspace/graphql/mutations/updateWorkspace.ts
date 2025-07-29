import { ROLE_FRAGMENT } from '@/settings/roles/graphql/fragments/roleFragment';
import { gql } from '@apollo/client';

export const UPDATE_WORKSPACE = gql`
  ${ROLE_FRAGMENT}
  mutation UpdateWorkspace($input: UpdateWorkspaceInput!) {
    updateWorkspace(data: $input) {
      id
      customDomain
      subdomain
      displayName
      logo
      allowImpersonation
      isPublicInviteLinkEnabled
      isGoogleAuthEnabled
      isMicrosoftAuthEnabled
      isPasswordAuthEnabled
      isTwoFactorAuthenticationEnforced
      defaultRole {
        ...RoleFragment
      }
    }
  }
`;
