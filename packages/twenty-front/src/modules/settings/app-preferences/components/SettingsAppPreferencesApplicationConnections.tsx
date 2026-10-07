import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { SettingsAppPreferencesApplicationAccountsTable } from '@/settings/app-preferences/components/SettingsAppPreferencesApplicationAccountsTable';
import { useMyAppPreferencesConnectedAccounts } from '@/settings/app-preferences/hooks/useMyAppPreferencesConnectedAccounts';
import { useMyAppPreferencesConnectionProviders } from '@/settings/app-preferences/hooks/useMyAppPreferencesConnectionProviders';
import { type AppPreferencesApplication } from '@/settings/app-preferences/types/AppPreferencesApplication';
import { type AppPreferencesConnectedAccount } from '@/settings/app-preferences/types/AppPreferencesConnectedAccount';
import { type AppPreferencesConnectionProvider } from '@/settings/app-preferences/types/AppPreferencesConnectionProvider';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { DisconnectConnectedAccountDocument } from '~/generated-metadata/graphql';
import { useTriggerAppOAuth } from '~/pages/settings/applications/hooks/useTriggerAppOAuth';

type SettingsAppPreferencesApplicationConnectionsProps = {
  application: AppPreferencesApplication;
};

export const SettingsAppPreferencesApplicationConnections = ({
  application,
}: SettingsAppPreferencesApplicationConnectionsProps) => {
  const { t } = useLingui();
  const { openDialog } = useDialog();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const {
    accounts,
    loading: accountsLoading,
    error: accountsError,
    refetch: refetchAccounts,
    canManageConnectedAccounts,
  } = useMyAppPreferencesConnectedAccounts();
  const {
    connectionProviders,
    loading: providersLoading,
    error: providersError,
    refetch: refetchProviders,
  } = useMyAppPreferencesConnectionProviders(application.id);
  const { triggerAppOAuth } = useTriggerAppOAuth();
  const [disconnectConnectedAccount] = useMutation(
    DisconnectConnectedAccountDocument,
  );
  const [isPending, setIsPending] = useState(false);
  const [actionError, setActionError] = useState<string>();
  const [accountToDisconnect, setAccountToDisconnect] =
    useState<AppPreferencesConnectedAccount>();
  const disconnectDialogId = `disconnect-app-preferences-account-${application.id}`;
  const appAccounts = accounts.filter(
    (account) => account.applicationId === application.id,
  );
  const canEditAccount = (account: AppPreferencesConnectedAccount) =>
    canManageConnectedAccounts &&
    account.visibility === 'user' &&
    isDefined(currentWorkspaceMember?.userWorkspaceId) &&
    account.userWorkspaceId === currentWorkspaceMember.userWorkspaceId;
  const availableProviders = connectionProviders.filter(
    (provider) =>
      provider.type === 'oauth' &&
      provider.oauth?.isClientCredentialsConfigured === true,
  );

  const handleConnect = async ({
    provider,
    account,
  }: {
    provider: AppPreferencesConnectionProvider;
    account?: AppPreferencesConnectedAccount;
  }) => {
    if (
      isPending ||
      !canManageConnectedAccounts ||
      !availableProviders.some(({ id }) => id === provider.id) ||
      (isDefined(account) && !canEditAccount(account))
    ) {
      return;
    }
    setIsPending(true);
    setActionError(undefined);
    try {
      await triggerAppOAuth({
        applicationId: application.id,
        providerName: provider.name,
        visibility: 'user',
        reconnectingConnectedAccountId: account?.id,
        redirectLocation: getSettingsPath(
          SettingsPath.AppPreferencesApplication,
          { applicationId: application.id },
        ),
      });
    } catch {
      setActionError(t`Unable to connect account. Try again.`);
    } finally {
      setIsPending(false);
    }
  };

  const handleDisconnect = async () => {
    if (
      isPending ||
      !isDefined(accountToDisconnect) ||
      !canEditAccount(accountToDisconnect)
    ) {
      return;
    }
    setIsPending(true);
    setActionError(undefined);
    try {
      await disconnectConnectedAccount({
        variables: { id: accountToDisconnect.id },
      });
      await refetchAccounts();
      setAccountToDisconnect(undefined);
    } catch {
      setActionError(t`Unable to disconnect account. Try again.`);
    } finally {
      setIsPending(false);
    }
  };

  const addAccountButton = (
    <Button
      startIcon={<IconPlus />}
      size="sm"
      variant="outline"
      disabled={isPending || availableProviders.length === 0}
      onClick={
        availableProviders.length === 1
          ? () => handleConnect({ provider: availableProviders[0] })
          : undefined
      }
    >{t`Add account`}</Button>
  );

  return (
    <Section.Root>
      <Section.Header
        title={t`Accounts`}
        description={t`Accounts used by ${application.name}`}
      />
      {!canManageConnectedAccounts ? (
        <InlineBanner
          variant="compact"
          color="blue"
          message={t`Your role does not allow managing connected accounts.`}
        />
      ) : accountsLoading || providersLoading ? (
        <SettingsSectionSkeletonLoader />
      ) : isDefined(accountsError) || isDefined(providersError) ? (
        <>
          <InlineBanner
            variant="compact"
            color="danger"
            message={t`Unable to load connected accounts.`}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              Promise.allSettled([refetchAccounts(), refetchProviders()])
            }
          >{t`Retry`}</Button>
        </>
      ) : (
        <>
          {isDefined(actionError) && (
            <InlineBanner
              variant="compact"
              color="danger"
              message={actionError}
            />
          )}
          {availableProviders.length === 0 && (
            <InlineBanner
              variant="compact"
              color="blue"
              message={t`Account connections are not configured for this app. Contact your administrator for help.`}
            />
          )}
          <SettingsAppPreferencesApplicationAccountsTable
            application={application}
            accounts={appAccounts}
            connectionProviders={connectionProviders}
            canEditAccount={canEditAccount}
            isPending={isPending}
            onReconnect={(account) => {
              const provider = connectionProviders.find(
                ({ id }) => id === account.connectionProviderId,
              );
              if (isDefined(provider)) {
                handleConnect({ provider, account });
              }
            }}
            onDisconnect={(account) => {
              setAccountToDisconnect(account);
              openDialog(disconnectDialogId);
            }}
          >
            {availableProviders.length > 1 ? (
              <DropdownRoot
                type="menu"
                dropdownId={`add-app-preferences-account-${application.id}`}
              >
                <Dropdown.Trigger render={addAccountButton} />
                <DropdownContent side="left" align="end">
                  <Dropdown.Section>
                    {availableProviders.map((provider) => (
                      <Dropdown.ActionItem
                        key={provider.id}
                        onClick={() => handleConnect({ provider })}
                      >
                        {provider.displayName}
                      </Dropdown.ActionItem>
                    ))}
                  </Dropdown.Section>
                </DropdownContent>
              </DropdownRoot>
            ) : (
              addAccountButton
            )}
          </SettingsAppPreferencesApplicationAccountsTable>
          <ConfirmationDialog
            dialogId={disconnectDialogId}
            title={t`Disconnect account`}
            subtitle={t`This account will stop syncing and its credentials will be removed. You can reconnect later.`}
            confirmButtonText={t`Disconnect account`}
            loading={isPending}
            onConfirmClick={handleDisconnect}
          />
        </>
      )}
    </Section.Root>
  );
};
