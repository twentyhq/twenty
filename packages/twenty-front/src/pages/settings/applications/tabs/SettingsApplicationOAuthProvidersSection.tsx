import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';

import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import { Button } from 'twenty-ui/input';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { DeleteConnectedAccountDocument } from '~/generated-metadata/graphql';
import { useFindApplicationOAuthProviders } from '~/pages/settings/applications/hooks/useFindApplicationOAuthProviders';
import { useMyAppConnectedAccounts } from '~/pages/settings/applications/hooks/useMyAppConnectedAccounts';
import { useTriggerAppOAuth } from '~/pages/settings/applications/hooks/useTriggerAppOAuth';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[3]};
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

const StyledTitle = styled.div`
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledWarning = styled.div`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.sm};
`;

export const SettingsApplicationOAuthProvidersSection = ({
  applicationId,
}: {
  applicationId: string;
}) => {
  const { t } = useLingui();
  const { triggerAppOAuth } = useTriggerAppOAuth();
  const { oauthProviders, loading } =
    useFindApplicationOAuthProviders(applicationId);
  const { accounts: connectedAccounts } = useMyAppConnectedAccounts();
  const [deleteConnectedAccount] = useMutation(
    DeleteConnectedAccountDocument,
    {
      refetchQueries: [{ query: GET_MY_CONNECTED_ACCOUNTS }],
    },
  );

  if (loading) {
    return null;
  }

  if (oauthProviders.length === 0) {
    return null;
  }

  return (
    <Section>
      <H2Title
        title={t`OAuth Connections`}
        description={t`Connect your account to providers this app integrates with.`}
      />
      <StyledList>
        {oauthProviders.map((provider) => {
          const connection = connectedAccounts.find(
            (account) => account.applicationOAuthProviderId === provider.id,
          );

          return (
            <StyledRow key={provider.id}>
              <StyledLeft>
                <StyledTitle>{provider.displayName}</StyledTitle>
                {connection ? (
                  <>
                    <StyledMeta>
                      <Trans>Connected as {connection.handle}</Trans>
                    </StyledMeta>
                    {connection.scopes && connection.scopes.length > 0 && (
                      <StyledMeta>
                        <Trans>Scopes:</Trans> {connection.scopes.join(', ')}
                      </StyledMeta>
                    )}
                    {connection.authFailedAt && (
                      <StyledWarning>
                        <Trans>
                          Authorization failed — please reconnect.
                        </Trans>
                      </StyledWarning>
                    )}
                  </>
                ) : (
                  <StyledMeta>
                    <Trans>
                      {provider.connectionMode === 'per-workspace'
                        ? 'Workspace-level connection (admin only)'
                        : 'Per-user connection'}
                    </Trans>
                  </StyledMeta>
                )}
              </StyledLeft>
              {connection ? (
                <Button
                  title={t`Disconnect`}
                  variant="secondary"
                  onClick={() =>
                    deleteConnectedAccount({
                      variables: { id: connection.id },
                    })
                  }
                />
              ) : (
                <Button
                  title={t`Connect ${provider.displayName}`}
                  variant="primary"
                  onClick={() =>
                    triggerAppOAuth({
                      applicationId,
                      providerName: provider.name,
                    })
                  }
                />
              )}
            </StyledRow>
          );
        })}
      </StyledList>
    </Section>
  );
};
