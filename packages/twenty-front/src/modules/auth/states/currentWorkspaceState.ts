import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import {
  type Application,
  type Role,
  type Workspace,
} from '~/generated-metadata/graphql';

export type CurrentWorkspace = Pick<
  Workspace,
  | 'id'
  | 'inviteHash'
  | 'logo'
  | 'displayName'
  | 'allowImpersonation'
  | 'featureFlags'
  | 'activationStatus'
  | 'billingSubscriptions'
  | 'billingEntitlements'
  | 'currentBillingSubscription'
  | 'workspaceMembersCount'
  | 'isPublicInviteLinkEnabled'
  | 'isGoogleAuthEnabled'
  | 'isGoogleAuthBypassEnabled'
  | 'isMicrosoftAuthEnabled'
  | 'isMicrosoftAuthBypassEnabled'
  | 'isPasswordAuthEnabled'
  | 'isPasswordAuthBypassEnabled'
  | 'isCustomDomainEnabled'
  | 'hasValidEnterpriseKey'
  | 'hasValidSignedEnterpriseKey'
  | 'hasValidEnterpriseValidityToken'
  | 'subdomain'
  | 'customDomain'
  | 'workspaceUrls'
  | 'metadataVersion'
  | 'isTwoFactorAuthenticationEnforced'
  | 'trashRetentionDays'
  | 'eventLogRetentionDays'
  | 'fastModel'
  | 'smartModel'
  | 'aiAdditionalInstructions'
  | 'editableProfileFields'
  | 'enabledAiModelIds'
  | 'useRecommendedModels'
  | 'isInternalMessagesImportEnabled'
> & {
  defaultRole?: Omit<Role, 'workspaceMembers' | 'agents' | 'apiKeys'> | null;
  workspaceCustomApplication: Pick<Application, 'id'> | null;
  installedApplications: Pick<
    Application,
    'id' | 'name' | 'universalIdentifier' | 'logo'
  >[];
};

export const currentWorkspaceState = createAtomState<CurrentWorkspace | null>({
  key: 'currentWorkspaceState',
  defaultValue: null,
});
