import { gql } from '@apollo/client';

export const CREATE_WORKSPACE = gql`
  mutation CreateWorkspace($input: CreateWorkspaceInput!) {
    createWorkspace(data: $input) {
      id
      firstName
      lastName
      email
      canImpersonate
      supportUserHash
      workspaceMember {
        id
        name {
          firstName
          lastName
        }
        colorScheme
        avatarUrl
        locale
      }
      defaultWorkspace {
        id
        displayName
        logo
        domainName
        inviteHash
        allowImpersonation
        subscriptionStatus
        featureFlags {
          id
          key
          value
          workspaceId
        }
      }
    }
  }
`;
