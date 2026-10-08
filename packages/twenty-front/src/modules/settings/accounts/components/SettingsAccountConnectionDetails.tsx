import { AppChip } from '@/applications/components/AppChip';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SettingsAccountGroupMenu } from '@/settings/accounts/components/SettingsAccountGroupMenu';
import { useConnectedAccountAdministration } from '@/settings/accounts/hooks/useConnectedAccountAdministration';
import { useTriggerProviderReconnect } from '@/settings/accounts/hooks/useTriggerProviderReconnect';
import { type ConsolidatedConnectedAccount } from '@/settings/accounts/types/ConsolidatedConnectedAccount';
import { FIND_APPLICATION_CONNECTION_PROVIDERS } from '@/settings/applications/graphql/queries/findApplicationConnectionProviders';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';
import { ConnectedAccountProvider, SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { InlineBanner, useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { IconAt, IconRefresh } from 'twenty-ui/icon';
import { Status, Tag } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { useTriggerAppOAuth } from '~/pages/settings/applications/hooks/useTriggerAppOAuth';
import { type FrontendApplicationConnectionProvider } from '~/pages/settings/applications/types/FrontendApplicationConnectionProvider';

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;
type SettingsAccountConnectionDetailsProps = {
  account: ConsolidatedConnectedAccount;
  groupId: string;
};

export const SettingsAccountConnectionDetails = ({
  account,
  groupId,
}: SettingsAccountConnectionDetailsProps) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { canManageAccount } = useConnectedAccountAdministration();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { triggerAppOAuth } = useTriggerAppOAuth();
  const { triggerProviderReconnect } = useTriggerProviderReconnect();
  const isAppConnection = account.provider === ConnectedAccountProvider.APP;
  const { data, loading, error, refetch } = useQuery<{
    applicationConnectionProviders: FrontendApplicationConnectionProvider[];
  }>(FIND_APPLICATION_CONNECTION_PROVIDERS, {
    variables: { applicationId: account.applicationId ?? '' },
    skip: !isAppConnection || !isDefined(account.applicationId),
  });
  const provider = data?.applicationConnectionProviders.find(
    (connectionProvider) =>
      connectionProvider.id === account.connectionProviderId,
  );
  const needsReconnect =
    isDefined(account.archivedAt) || isDefined(account.authFailedAt);
  const canReconnect =
    canManageAccount(account) &&
    (isAppConnection ||
      account.userWorkspaceId === currentWorkspaceMember?.userWorkspaceId);
  const handleReconnect = async () => {
    try {
      if (
        isAppConnection &&
        isDefined(account.applicationId) &&
        isDefined(provider)
      ) {
        await triggerAppOAuth({
          applicationId: account.applicationId,
          providerName: provider.name,
          visibility: account.visibility === 'workspace' ? 'workspace' : 'user',
          reconnectingConnectedAccountId: account.id,
          redirectLocation: getSettingsPath(SettingsPath.Accounts),
        });
      } else if (
        account.provider === ConnectedAccountProvider.GOOGLE ||
        account.provider === ConnectedAccountProvider.MICROSOFT
      ) {
        await triggerProviderReconnect(account.provider, account.id, {
          loginHint: account.handle,
        });
      }
    } catch (reconnectError) {
      enqueueToast(getToastOptionsFromError({ error: reconnectError }));
    }
  };

  return (
    <Section.Root>
      {isAppConnection && (
        <Section.Header
          title={
            isDefined(account.applicationId) ? (
              <AppChip
                applicationId={account.applicationId}
                fallbackApplicationData={{ name: t`Application` }}
              />
            ) : (
              t`Connection`
            )
          }
          description={provider?.displayName ?? account.name ?? account.handle}
        />
      )}
      <StyledActions>
        <Status
          color={
            isDefined(account.archivedAt)
              ? 'gray'
              : isDefined(account.authFailedAt)
                ? 'red'
                : 'green'
          }
        >
          {isDefined(account.archivedAt)
            ? t`Disconnected`
            : isDefined(account.authFailedAt)
              ? t`Reconnect needed`
              : t`Connected`}
        </Status>
        <Status color="gray">
          {account.visibility === 'workspace'
            ? t`Workspace shared`
            : t`Just for me`}
        </Status>
        {canReconnect &&
          needsReconnect &&
          account.provider !== ConnectedAccountProvider.EMAIL_GROUP &&
          account.provider !== ConnectedAccountProvider.IMAP_SMTP_CALDAV && (
            <Button
              variant="outline"
              startIcon={<IconRefresh />}
              disabled={
                loading ||
                (isAppConnection &&
                  !provider?.oauth?.isClientCredentialsConfigured)
              }
              onClick={handleReconnect}
            >{t`Reconnect`}</Button>
          )}
        {canManageAccount(account) &&
          account.provider === ConnectedAccountProvider.IMAP_SMTP_CALDAV && (
            <Button
              variant="outline"
              startIcon={<IconAt />}
              href={getSettingsPath(SettingsPath.EditImapSmtpCaldavConnection, {
                connectedAccountId: account.id,
              })}
              render={
                <Link
                  to={getSettingsPath(
                    SettingsPath.EditImapSmtpCaldavConnection,
                    { connectedAccountId: account.id },
                  )}
                />
              }
            >{t`Connection settings`}</Button>
          )}
        <SettingsAccountGroupMenu
          group={{ id: groupId, handle: account.handle, accounts: [account] }}
          scope="connection"
        />
      </StyledActions>
      {isAppConnection && isNonEmptyArray(account.scopes) && (
        <StyledActions>
          {account.scopes.map((scope) => (
            <Tag key={scope} color="gray">
              {scope}
            </Tag>
          ))}
        </StyledActions>
      )}
      {!canManageAccount(account) && (
        <InlineBanner
          status="info"
          layout="compact"
        >{t`This shared connection is managed by its owner or an administrator.`}</InlineBanner>
      )}
      {isDefined(error) ? (
        <>
          <InlineBanner
            status="error"
            layout="compact"
          >{t`The connection provider could not be loaded.`}</InlineBanner>
          <Button
            variant="outline"
            onClick={() => refetch()}
          >{t`Retry`}</Button>
        </>
      ) : (
        isAppConnection &&
        !loading &&
        !isDefined(provider) && (
          <InlineBanner
            status="info"
            layout="compact"
          >{t`This connection's app or provider is unavailable. Its existing connection can still be managed.`}</InlineBanner>
        )
      )}
      {isDefined(provider) &&
        !provider.oauth?.isClientCredentialsConfigured && (
          <InlineBanner
            status="info"
            layout="compact"
          >{t`Account connections are not configured for this app. Contact your administrator for help.`}</InlineBanner>
        )}
    </Section.Root>
  );
};
