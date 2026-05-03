import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { H2Title, Info, Status } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { DeleteConnectedAccountDocument } from '~/generated-metadata/graphql';
import { SettingsApplicationConnectScopePickerModal } from '~/pages/settings/applications/components/SettingsApplicationConnectScopePickerModal';
import { useFindApplicationConnectionProviders } from '~/pages/settings/applications/hooks/useFindApplicationConnectionProviders';
import { useMyAppConnectedAccounts } from '~/pages/settings/applications/hooks/useMyAppConnectedAccounts';
import { useTriggerAppOAuth } from '~/pages/settings/applications/hooks/useTriggerAppOAuth';
import { type FrontendApplicationConnectionProvider } from '~/pages/settings/applications/types/FrontendApplicationConnectionProvider';

const SCOPE_PICKER_MODAL_ID = 'app-connection-scope-picker';

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const SettingsApplicationConnectionsSection = ({
  applicationId,
}: {
  applicationId: string;
}) => {
  const { t } = useLingui();
  const { triggerAppOAuth } = useTriggerAppOAuth();
  const { openModal } = useModal();
  const { connectionProviders, loading } =
    useFindApplicationConnectionProviders(applicationId);
  const { accounts: connectedAccounts } = useMyAppConnectedAccounts();
  const [deleteConnectedAccount] = useMutation(DeleteConnectedAccountDocument, {
    refetchQueries: [{ query: GET_MY_CONNECTED_ACCOUNTS }],
  });

  // Tracks which provider's "Add connection" was clicked so the scope picker
  // modal knows the displayName + which provider to launch OAuth for.
  const [pendingProvider, setPendingProvider] =
    useState<FrontendApplicationConnectionProvider | null>(null);

  if (loading || connectionProviders.length === 0) {
    return null;
  }

  return (
    <>
      {connectionProviders.map((provider) => {
        const isOAuth = provider.type === 'oauth';
        const isClientCredentialsConfigured =
          provider.oauth?.isClientCredentialsConfigured ?? false;

        const providerConnections = connectedAccounts.filter(
          (account) => account.applicationConnectionProviderId === provider.id,
        );

        return (
          <Section key={provider.id}>
            <H2Title
              title={provider.displayName}
              description={t`Manage connections used by this app to call ${provider.displayName}.`}
            />
            {isOAuth && !isClientCredentialsConfigured && (
              <Info
                accent="danger"
                text={t`${provider.displayName} OAuth is not yet set up by your server administrator. They need to fill in the OAuth client ID and secret on the application registration before you can add a connection.`}
              />
            )}
            <SettingsListCard
              items={providerConnections.map((connection) => ({
                id: connection.id,
                label: connection.name ?? connection.handle,
                scope: connection.scope,
                authFailedAt: connection.authFailedAt,
                providerName: provider.name,
              }))}
              getItemLabel={(item) => item.label}
              hasFooter={isClientCredentialsConfigured}
              footerButtonLabel={t`Add connection`}
              onFooterButtonClick={() => {
                setPendingProvider(provider);
                openModal(SCOPE_PICKER_MODAL_ID);
              }}
              RowRightComponent={({ item }) => (
                <StyledRowRightContainer>
                  <Status
                    color={item.scope === 'workspace' ? 'blue' : 'gray'}
                    text={
                      item.scope === 'workspace' ? t`Workspace` : t`Just me`
                    }
                  />
                  {item.authFailedAt && (
                    <Status color="red" text={t`Reconnect needed`} />
                  )}
                  {item.authFailedAt && (
                    <Button
                      title={t`Reconnect`}
                      variant="secondary"
                      accent="blue"
                      size="small"
                      onClick={() =>
                        triggerAppOAuth({
                          applicationId,
                          providerName: item.providerName,
                          scope: item.scope,
                          reconnectingConnectedAccountId: item.id,
                        })
                      }
                    />
                  )}
                  <Button
                    title={t`Delete`}
                    variant="secondary"
                    accent="danger"
                    size="small"
                    onClick={() =>
                      deleteConnectedAccount({ variables: { id: item.id } })
                    }
                  />
                </StyledRowRightContainer>
              )}
            />
          </Section>
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
    </>
  );
};
