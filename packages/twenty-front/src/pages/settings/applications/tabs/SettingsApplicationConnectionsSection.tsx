import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { Button } from 'twenty-ui/input';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { DeleteConnectedAccountDocument } from '~/generated-metadata/graphql';
import { SettingsApplicationConnectScopePickerModal } from '~/pages/settings/applications/components/SettingsApplicationConnectScopePickerModal';
import { useFindApplicationOAuthProviders } from '~/pages/settings/applications/hooks/useFindApplicationOAuthProviders';
import {
  type AppConnectedAccount,
  useMyAppConnectedAccounts,
} from '~/pages/settings/applications/hooks/useMyAppConnectedAccounts';
import { useTriggerAppOAuth } from '~/pages/settings/applications/hooks/useTriggerAppOAuth';
import { type FrontendApplicationOAuthProvider } from '~/pages/settings/applications/types/FrontendApplicationOAuthProvider';

const SCOPE_PICKER_MODAL_ID = 'app-connection-scope-picker';

const StyledProviderBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledProviderHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledProviderTitle = styled.div`
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledRow = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledRowTitle = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  align-items: center;
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledScopeBadge = styled.span`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  padding: 2px ${themeCssVariables.spacing[2]};
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledWarning = styled.div`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledEmpty = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-style: italic;
`;

export const SettingsApplicationConnectionsSection = ({
  applicationId,
}: {
  applicationId: string;
}) => {
  const { t } = useLingui();
  const { triggerAppOAuth } = useTriggerAppOAuth();
  const { openModal } = useModal();
  const { oauthProviders, loading } =
    useFindApplicationOAuthProviders(applicationId);
  const { accounts: connectedAccounts } = useMyAppConnectedAccounts();
  const [deleteConnectedAccount] = useMutation(
    DeleteConnectedAccountDocument,
    {
      refetchQueries: [{ query: GET_MY_CONNECTED_ACCOUNTS }],
    },
  );

  const [pendingProvider, setPendingProvider] =
    useState<FrontendApplicationOAuthProvider | null>(null);

  if (loading) {
    return null;
  }

  if (oauthProviders.length === 0) {
    return null;
  }

  const handleStartConnect = (provider: FrontendApplicationOAuthProvider) => {
    setPendingProvider(provider);
    openModal(SCOPE_PICKER_MODAL_ID);
  };

  const handleScopeConfirmed = (scope: 'user' | 'workspace') => {
    if (!pendingProvider) {
      return;
    }
    triggerAppOAuth({
      applicationId,
      providerName: pendingProvider.name,
      scope,
    });
  };

  const handleReconnect = (
    provider: FrontendApplicationOAuthProvider,
    connection: AppConnectedAccount,
  ) => {
    triggerAppOAuth({
      applicationId,
      providerName: provider.name,
      scope: connection.scope,
      reconnectingConnectedAccountId: connection.id,
    });
  };

  return (
    <Section>
      <H2Title
        title={t`Connections`}
        description={t`Manage the credentials this app uses to call third-party providers.`}
      />
      {oauthProviders.map((provider) => {
        const providerConnections = connectedAccounts.filter(
          (account) => account.applicationOAuthProviderId === provider.id,
        );

        return (
          <StyledProviderBlock key={provider.id}>
            <StyledProviderHeader>
              <StyledProviderTitle>{provider.displayName}</StyledProviderTitle>
              <Button
                title={t`Add connection`}
                variant="secondary"
                onClick={() => handleStartConnect(provider)}
              />
            </StyledProviderHeader>
            <StyledList>
              {providerConnections.length === 0 ? (
                <StyledEmpty>
                  <Trans>No connection yet.</Trans>
                </StyledEmpty>
              ) : (
                providerConnections.map((connection) => (
                  <StyledRow key={connection.id}>
                    <StyledLeft>
                      <StyledRowTitle>
                        {connection.name ?? connection.handle}
                        <StyledScopeBadge>
                          {connection.scope === 'workspace'
                            ? t`Workspace`
                            : t`Just me`}
                        </StyledScopeBadge>
                      </StyledRowTitle>
                      {connection.handle && connection.name && (
                        <StyledMeta>{connection.handle}</StyledMeta>
                      )}
                      {connection.lastCredentialsRefreshedAt && (
                        <StyledMeta>
                          <Trans>
                            Refreshed{' '}
                            {new Date(
                              connection.lastCredentialsRefreshedAt,
                            ).toLocaleString()}
                          </Trans>
                        </StyledMeta>
                      )}
                      {connection.authFailedAt && (
                        <StyledWarning>
                          <Trans>
                            Authorization failed — please reconnect.
                          </Trans>
                        </StyledWarning>
                      )}
                    </StyledLeft>
                    <StyledActions>
                      {connection.authFailedAt && (
                        <Button
                          title={t`Reconnect`}
                          variant="secondary"
                          accent="blue"
                          onClick={() => handleReconnect(provider, connection)}
                        />
                      )}
                      <Button
                        title={t`Delete`}
                        variant="secondary"
                        accent="danger"
                        onClick={() =>
                          deleteConnectedAccount({
                            variables: { id: connection.id },
                          })
                        }
                      />
                    </StyledActions>
                  </StyledRow>
                ))
              )}
            </StyledList>
          </StyledProviderBlock>
        );
      })}
      <SettingsApplicationConnectScopePickerModal
        modalInstanceId={SCOPE_PICKER_MODAL_ID}
        providerDisplayName={pendingProvider?.displayName ?? ''}
        onConfirm={handleScopeConfirmed}
      />
    </Section>
  );
};
