import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { DELETE_CONNECTED_ACCOUNT } from '@/settings/accounts/graphql/mutations/deleteConnectedAccount';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical, IconRefresh, IconUnlink } from 'twenty-ui/icon';
import { Status } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';
import { useFindApplicationConnectionProviders } from '~/pages/settings/applications/hooks/useFindApplicationConnectionProviders';
import { useTriggerAppOAuth } from '~/pages/settings/applications/hooks/useTriggerAppOAuth';

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
`;

type SettingsAppPreferencesApplicationAccountRowRightContainerProps = {
  account: ConnectedAccount;
};

// An account connected through an app's own OAuth provider has no message or
// calendar channel, so its status is the credential's and its actions are the
// app connection's.
export const SettingsAppPreferencesApplicationAccountRowRightContainer = ({
  account,
}: SettingsAppPreferencesApplicationAccountRowRightContainerProps) => {
  const { t } = useLingui();
  const { openDialog } = useDialog();
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
  const needsReconnect = isDefined(account.authFailedAt);
  const canReconnect =
    needsReconnect && isDefined(applicationId) && isDefined(connectionProvider);

  const reconnect = () => {
    if (!isDefined(applicationId) || !isDefined(connectionProvider)) {
      return;
    }

    triggerAppOAuth({
      applicationId,
      providerName: connectionProvider.name,
      visibility: account.visibility,
      reconnectingConnectedAccountId: account.id,
      redirectLocation: getSettingsPath(SettingsPath.Accounts),
    });
  };

  const disconnect = async () => {
    await deleteConnectedAccountMutation({ variables: { id: account.id } });
    await apolloClient.refetchQueries({ include: 'active' });
  };

  return (
    <StyledRowRightContainer>
      {needsReconnect ? (
        <Status color="red" weight="medium">{t`Reconnect needed`}</Status>
      ) : (
        <Status color="green" weight="medium">{t`Connected`}</Status>
      )}
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
    </StyledRowRightContainer>
  );
};
