import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import {
  H2Title,
  IconPlus,
  IconUser,
  IconUsers,
  Info,
  Status,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { MenuItem } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { DeleteConnectedAccountDocument } from '~/generated-metadata/graphql';
import { useFindApplicationConnectionProviders } from '~/pages/settings/applications/hooks/useFindApplicationConnectionProviders';
import { useMyAppConnectedAccounts } from '~/pages/settings/applications/hooks/useMyAppConnectedAccounts';
import { useTriggerAppOAuth } from '~/pages/settings/applications/hooks/useTriggerAppOAuth';
import { type FrontendApplicationConnectionProvider } from '~/pages/settings/applications/types/FrontendApplicationConnectionProvider';

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: ${themeCssVariables.spacing[2]};
`;

// Inline split button: a "Add connection" CTA whose click opens a small
// Dropdown menu with the two visibility choices ("Just for me" / "Workspace
// shared"). Replaces an earlier full-screen modal that didn't match the
// rest of the settings UI.
const AddConnectionDropdown = ({
  provider,
  onPick,
}: {
  provider: FrontendApplicationConnectionProvider;
  onPick: (visibility: 'user' | 'workspace') => void;
}) => {
  const { t } = useLingui();
  const dropdownId = `app-connection-add-${provider.id}`;
  const { closeDropdown } = useCloseDropdown();

  const handleSelect = (visibility: 'user' | 'workspace') => {
    closeDropdown(dropdownId);
    onPick(visibility);
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-start"
      clickableComponent={
        <Button
          title={t`Add connection`}
          Icon={IconPlus}
          variant="secondary"
          accent="default"
          size="small"
        />
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            <MenuItem
              text={t`Just for me`}
              LeftIcon={IconUser}
              onClick={() => handleSelect('user')}
            />
            <MenuItem
              text={t`Workspace shared`}
              LeftIcon={IconUsers}
              onClick={() => handleSelect('workspace')}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};

export const SettingsApplicationConnectionsSection = ({
  applicationId,
}: {
  applicationId: string;
}) => {
  const { t } = useLingui();
  const { triggerAppOAuth } = useTriggerAppOAuth();
  const { connectionProviders, loading } =
    useFindApplicationConnectionProviders(applicationId);
  const { accounts: connectedAccounts } = useMyAppConnectedAccounts();
  const [deleteConnectedAccount] = useMutation(DeleteConnectedAccountDocument, {
    refetchQueries: [{ query: GET_MY_CONNECTED_ACCOUNTS }],
  });

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
            {providerConnections.length > 0 && (
              <SettingsListCard
                items={providerConnections.map((connection) => ({
                  id: connection.id,
                  label: connection.name ?? connection.handle,
                  // GraphQL types `visibility` as `string`; the column is
                  // constrained to one of these two values at write time.
                  visibility: connection.visibility as 'user' | 'workspace',
                  authFailedAt: connection.authFailedAt,
                  providerName: provider.name,
                }))}
                getItemLabel={(item) => item.label}
                RowRightComponent={({ item }) => (
                  <StyledRowRightContainer>
                    <Status
                      color={item.visibility === 'workspace' ? 'blue' : 'gray'}
                      text={
                        item.visibility === 'workspace'
                          ? t`Workspace`
                          : t`Just me`
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
                            visibility: item.visibility,
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
            )}
            {isClientCredentialsConfigured && (
              <StyledFooter>
                <AddConnectionDropdown
                  provider={provider}
                  onPick={(visibility) =>
                    triggerAppOAuth({
                      applicationId,
                      providerName: provider.name,
                      visibility,
                    })
                  }
                />
              </StyledFooter>
            )}
          </Section>
        );
      })}
    </>
  );
};
