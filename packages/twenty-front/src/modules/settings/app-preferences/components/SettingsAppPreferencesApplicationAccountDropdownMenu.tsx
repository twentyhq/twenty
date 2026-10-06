import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { DELETE_CONNECTED_ACCOUNT } from '@/settings/accounts/graphql/mutations/deleteConnectedAccount';
import { canAdministerConnectedAccount } from '@/settings/app-preferences/utils/canAdministerConnectedAccount';
import { getApplicationAccountStatus } from '@/settings/app-preferences/utils/getApplicationAccountStatus';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical, IconRefresh, IconUnlink } from 'twenty-ui/icon';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useFindApplicationConnectionProviders } from '~/pages/settings/applications/hooks/useFindApplicationConnectionProviders';
import { useTriggerAppOAuth } from '~/pages/settings/applications/hooks/useTriggerAppOAuth';

type SettingsAppPreferencesApplicationAccountDropdownMenuProps = {
  account: ConnectedAccount;
  redirectLocation?: string;
};

// An account connected through an app's own OAuth provider has no message or
// calendar channel, so its actions are the app connection's.
export const SettingsAppPreferencesApplicationAccountDropdownMenu = ({
  account,
  redirectLocation = getSettingsPath(SettingsPath.Accounts),
}: SettingsAppPreferencesApplicationAccountDropdownMenuProps) => {
  const { t } = useLingui();
  const { openDialog } = useDialog();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const hasApplicationsPermission = useHasPermissionFlag(
    PermissionFlagType.APPLICATIONS,
  );
  const apolloClient = useApolloClient();
  const { triggerAppOAuth } = useTriggerAppOAuth();
  const { connectionProviders } = useFindApplicationConnectionProviders(
    account.applicationId ?? undefined,
  );
  const [deleteConnectedAccountMutation] = useMutation(
    DELETE_CONNECTED_ACCOUNT,
  );

  const dropdownId = `settings-app-preferences-account-row-${account.id}`;
  const disconnectDialogId = `disconnect-app-account-dialog-${account.id}`;
  const accountHandle = account.handle;

  const connectionProvider = connectionProviders.find(
    (provider) => provider.id === account.connectionProviderId,
  );
  const applicationId = account.applicationId;
  const canReconnect =
    getApplicationAccountStatus(account) !== 'CONNECTED' &&
    isDefined(applicationId) &&
    isDefined(connectionProvider);

  const reconnect = () => {
    if (!isDefined(applicationId) || !isDefined(connectionProvider)) {
      return;
    }

    triggerAppOAuth({
      applicationId,
      providerName: connectionProvider.name,
      visibility: account.visibility,
      reconnectingConnectedAccountId: account.id,
      redirectLocation,
    });
  };

  const disconnect = async () => {
    await deleteConnectedAccountMutation({ variables: { id: account.id } });
    await apolloClient.refetchQueries({ include: 'active' });
  };

  // A workspace-shared account owned by someone else is listed so the member
  // sees what the app can use, but the server refuses their actions on it.
  if (
    !canAdministerConnectedAccount({
      account,
      currentUserWorkspaceId: currentWorkspaceMember?.userWorkspaceId,
      hasAdministrationPermission: hasApplicationsPermission,
    })
  ) {
    return null;
  }

  return (
    <>
      <DropdownRoot type="menu" dropdownId={dropdownId}>
        <Dropdown.Trigger
          render={
            <LightIconButton emphasis="subtle" aria-label={t`More options`}>
              <IconDotsVertical />
            </LightIconButton>
          }
        />
        <DropdownContent side="right" align="start">
          <Dropdown.Section>
            {canReconnect && (
              <Dropdown.ActionItem
                startIcon={<IconRefresh />}
                onClick={reconnect}
              >{t`Reconnect`}</Dropdown.ActionItem>
            )}
            <Dropdown.ActionItem
              color="danger"
              startIcon={<IconUnlink />}
              onClick={() => openDialog(disconnectDialogId)}
            >{t`Disconnect`}</Dropdown.ActionItem>
          </Dropdown.Section>
        </DropdownContent>
      </DropdownRoot>
      <ConfirmationDialog
        dialogId={disconnectDialogId}
        title={t`Disconnect account?`}
        subtitle={
          <Trans>
            The app will no longer be able to use {accountHandle}. You can
            connect it again at any time.
          </Trans>
        }
        onConfirmClick={disconnect}
        confirmButtonText={t`Disconnect`}
      />
    </>
  );
};
