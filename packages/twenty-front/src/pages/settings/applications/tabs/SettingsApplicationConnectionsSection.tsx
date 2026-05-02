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
import { useMyAppConnectedAccounts } from '~/pages/settings/applications/hooks/useMyAppConnectedAccounts';
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

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledWarning = styled.div`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.sm};
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
    { refetchQueries: [{ query: GET_MY_CONNECTED_ACCOUNTS }] },
  );

  // Tracks which provider's "Add connection" was clicked so the scope picker
  // modal knows the displayName + which provider to launch OAuth for.
  const [pendingProvider, setPendingProvider] =
    useState<FrontendApplicationOAuthProvider | null>(null);

  if (loading || oauthProviders.length === 0) {
    return null;
  }

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
              <strong>{provider.displayName}</strong>
              <Button
                title={t`Add connection`}
                variant="secondary"
                onClick={() => {
                  setPendingProvider(provider);
                  openModal(SCOPE_PICKER_MODAL_ID);
                }}
              />
            </StyledProviderHeader>
            {providerConnections.length === 0 ? (
              <StyledMeta>
                <Trans>No connection yet.</Trans>
              </StyledMeta>
            ) : (
              providerConnections.map((connection) => (
                <StyledRow key={connection.id}>
                  <div>
                    <strong>{connection.name ?? connection.handle}</strong>{' '}
                    <StyledMeta as="span">
                      {connection.scope === 'workspace'
                        ? t`(workspace)`
                        : t`(just me)`}
                    </StyledMeta>
                    {connection.authFailedAt && (
                      <StyledWarning>
                        <Trans>Authorization failed — please reconnect.</Trans>
                      </StyledWarning>
                    )}
                  </div>
                  <div>
                    {connection.authFailedAt && (
                      <Button
                        title={t`Reconnect`}
                        variant="secondary"
                        accent="blue"
                        onClick={() =>
                          triggerAppOAuth({
                            applicationId,
                            providerName: provider.name,
                            scope: connection.scope,
                            reconnectingConnectedAccountId: connection.id,
                          })
                        }
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
                  </div>
                </StyledRow>
              ))
            )}
          </StyledProviderBlock>
        );
      })}
      <SettingsApplicationConnectScopePickerModal
        modalInstanceId={SCOPE_PICKER_MODAL_ID}
        providerDisplayName={pendingProvider?.displayName ?? ''}
        onConfirm={(scope) => {
          if (pendingProvider) {
            triggerAppOAuth({
              applicationId,
              providerName: pendingProvider.name,
              scope,
            });
          }
        }}
      />
    </Section>
  );
};
