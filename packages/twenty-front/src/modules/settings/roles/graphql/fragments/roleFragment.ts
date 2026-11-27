import { gql } from '@apollo/client';

export const ROLE_FRAGMENT = gql`
  fragment RoleFragment on Role {
    id
    label
    description
    icon
    canUpdateAllSettings
    canAccessAllTools
    canAccessAllAgentChatChannels
    isEditable
    # TODO(@charlesBochet): temporary Admin record permissions exception, remove once the workspace owns Admin's record permissions
    areRecordPermissionsEditable
    canReadAllObjectRecords
    canUpdateAllObjectRecords
    canSoftDeleteAllObjectRecords
    canDestroyAllObjectRecords
    canBeAssignedToUsers
    canBeAssignedToAgents
    canBeAssignedToApiKeys
    applicationId
    universalIdentifier
  }
`;
