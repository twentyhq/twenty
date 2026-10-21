import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { getApplicationDisplayName } from '@/applications/utils/getApplicationDisplayName';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsAppPreferencesDisconnectConnectionDialog } from '@/settings/app-preferences/components/SettingsAppPreferencesDisconnectConnectionDialog';
import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { getApplicationPreferencesConnectionsPath } from '@/settings/app-preferences/utils/getApplicationPreferencesConnectionsPath';
import { useTriggerAppOAuth } from '@/settings/applications/hooks/useTriggerAppOAuth';
import { isApplicationConnectionReconnectNeeded } from '@/settings/applications/utils/isApplicationConnectionReconnectNeeded';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { Fragment } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical, IconRefresh, IconUnlink } from 'twenty-ui/icon';

type SettingsAppPreferencesAppAccountsRowDropdownMenuProps = {
  groupId: string;
  appAccounts: ConnectedAccount[];
};

export const SettingsAppPreferencesAppAccountsRowDropdownMenu = ({
  groupId,
  appAccounts,
}: SettingsAppPreferencesAppAccountsRowDropdownMenuProps) => {
  const { t } = useLingui();
  const { openDialog } = useDialog();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { triggerAppOAuth } = useTriggerAppOAuth();
  const { applicationsWithPreferences } = useApplicationsWithPreferences();

  const userConnectionProviders = applicationsWithPreferences.flatMap(
    ({ connectionProviders }) => connectionProviders,
  );

  const isLabelledByApplication = appAccounts.length > 1;

  const accountActions = appAccounts.map((account) => {
    const provider = userConnectionProviders.find(
      ({ id }) => id === account.connectionProviderId,
    );
    const application = currentWorkspace?.installedApplications.find(
      ({ id }) => id === account.applicationId,
    );
    const applicationName = isDefined(application)
      ? getApplicationDisplayName({ application, currentWorkspace })
      : t`Application`;
    const connectionLabel = account.name ?? account.handle;

    return {
      account,
      applicationName,
      connectionLabel,
      disconnectDialogId: `disconnect-app-account-modal-${account.id}`,
      canReconnect:
        isDefined(provider) &&
        isDefined(account.applicationId) &&
        (provider.oauth?.isClientCredentialsConfigured ?? false) &&
        isApplicationConnectionReconnectNeeded(account),
      reconnect: () => {
        if (!isDefined(provider) || !isDefined(account.applicationId)) {
          return;
        }

        triggerAppOAuth({
          applicationId: account.applicationId,
          providerName: provider.name,
          scope: 'USER',
          reconnectingConnectedAccountId: account.id,
          redirectLocation: getApplicationPreferencesConnectionsPath(
            account.applicationId,
          ),
        });
      },
    };
  });

  return (
    <>
      <DropdownRoot
        type="menu"
        dropdownId={`settings-app-accounts-row-${groupId}`}
      >
        <Dropdown.Trigger
          render={
            <LightIconButton emphasis="subtle" aria-label={t`More options`}>
              <IconDotsVertical />
            </LightIconButton>
          }
        />
        <DropdownContent side="right" align="start">
          <Dropdown.Section>
            {accountActions.map(
              ({
                account,
                applicationName,
                disconnectDialogId,
                canReconnect,
                reconnect,
              }) => (
                <Fragment key={account.id}>
                  {canReconnect && (
                    <Dropdown.ActionItem
                      startIcon={<IconRefresh />}
                      onClick={reconnect}
                    >
                      {isLabelledByApplication
                        ? t`Reconnect ${applicationName}`
                        : t`Reconnect`}
                    </Dropdown.ActionItem>
                  )}
                  <Dropdown.ActionItem
                    startIcon={<IconUnlink />}
                    onClick={() => openDialog(disconnectDialogId)}
                  >
                    {isLabelledByApplication
                      ? t`Disconnect ${applicationName}`
                      : t`Disconnect`}
                  </Dropdown.ActionItem>
                </Fragment>
              ),
            )}
          </Dropdown.Section>
        </DropdownContent>
      </DropdownRoot>
      {accountActions.map(
        ({ account, connectionLabel, disconnectDialogId }) => (
          <SettingsAppPreferencesDisconnectConnectionDialog
            key={account.id}
            dialogId={disconnectDialogId}
            connectedAccountId={account.id}
            connectionLabel={connectionLabel}
          />
        ),
      )}
    </>
  );
};
