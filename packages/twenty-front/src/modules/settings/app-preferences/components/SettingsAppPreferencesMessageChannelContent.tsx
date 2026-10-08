import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { settingsAccountsSelectedMessageChannelState } from '@/settings/accounts/states/settingsAccountsSelectedMessageChannelState';
import { SettingsAppPreferencesMessaging } from '@/settings/app-preferences/components/SettingsAppPreferencesMessaging';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { SettingsAccountsConfigurationSelectedMessageChannelEffect } from '~/pages/settings/accounts/SettingsAccountsConfigurationSelectedMessageChannelEffect';

type SettingsAppPreferencesMessageChannelContentProps = {
  messageChannel: MessageChannel;
  connectedAccount: Pick<ConnectedAccount, 'userWorkspaceId' | 'visibility'>;
};

export const SettingsAppPreferencesMessageChannelContent = ({
  messageChannel,
  connectedAccount,
}: SettingsAppPreferencesMessageChannelContentProps) => {
  const { t } = useLingui();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const canManageWorkspace = useHasPermissionFlag(PermissionFlagType.WORKSPACE);
  const settingsAccountsSelectedMessageChannel = useAtomStateValue(
    settingsAccountsSelectedMessageChannelState,
  );

  const canEditMessageChannel =
    (isDefined(currentWorkspaceMember?.userWorkspaceId) &&
      connectedAccount.userWorkspaceId ===
        currentWorkspaceMember.userWorkspaceId) ||
    (connectedAccount.visibility === 'workspace' && canManageWorkspace);

  if (!canEditMessageChannel) {
    return (
      <InlineBanner
        variant="compact"
        color="blue"
        message={t`This shared account is managed by its owner or a workspace administrator.`}
      />
    );
  }

  return (
    <>
      <SettingsAccountsConfigurationSelectedMessageChannelEffect
        messageChannel={messageChannel}
      />
      {settingsAccountsSelectedMessageChannel?.id === messageChannel.id ? (
        <SettingsAppPreferencesMessaging messageChannel={messageChannel} />
      ) : (
        <SettingsSectionSkeletonLoader />
      )}
    </>
  );
};
