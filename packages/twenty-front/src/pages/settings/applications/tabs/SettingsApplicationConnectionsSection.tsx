import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext, useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import {
  ConfirmationModal,
  StyledCenteredButton,
} from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { Avatar, Status } from 'twenty-ui/data-display';
import { Info } from 'twenty-ui/feedback';
import {
  IconChevronRight,
  IconPlus,
  IconUser,
  IconUsers,
} from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/typography';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { MenuItem } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useFindApplicationConnectionProviders } from '~/pages/settings/applications/hooks/useFindApplicationConnectionProviders';
import {
  type AppConnectedAccount,
  useMyAppConnectedAccounts,
} from '~/pages/settings/applications/hooks/useMyAppConnectedAccounts';
import { useTriggerAppOAuth } from '~/pages/settings/applications/hooks/useTriggerAppOAuth';
import { type FrontendApplicationConnectionProvider } from '~/pages/settings/applications/types/FrontendApplicationConnectionProvider';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const CONNECTION_TABLE_ROW_GRID_TEMPLATE_COLUMNS =
  'minmax(0, 1fr) 160px 180px 36px';

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledTableRowsContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const getConnectionName = (connection: AppConnectedAccount) =>
  connection.name ?? connection.handle;

const getConnectionVisibility = (
  connection: AppConnectedAccount,
): 'user' | 'workspace' =>
  connection.visibility === 'workspace' ? 'workspace' : 'user';

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

type AddConnectionConfirmation = {
  title: string;
  subtitle: string;
  confirmButtonText: string;
  onConfirmClick: () => void;
  onConnectAnotherAccount: (() => void) | null;
};

type AddConnectionActionProps = {
  applicationId: string;
  provider: FrontendApplicationConnectionProvider;
  providerConnections: AppConnectedAccount[];
};

const AddConnectionAction = ({
  applicationId,
  provider,
  providerConnections,
}: AddConnectionActionProps) => {
  const { t } = useLingui();
  const { openModal, closeModal } = useModal();
  const { triggerAppOAuth } = useTriggerAppOAuth();
  const [confirmation, setConfirmation] =
    useState<AddConnectionConfirmation | null>(null);

  const modalId = `add-application-connection-modal-${provider.id}`;

  const connectAnotherAccount = (visibility: 'user' | 'workspace') => {
    triggerAppOAuth({
      applicationId,
      providerName: provider.name,
      visibility,
    });
  };

  const reconnectExistingConnection = ({
    connection,
    visibility,
  }: {
    connection: AppConnectedAccount;
    visibility: 'user' | 'workspace';
  }) => {
    triggerAppOAuth({
      applicationId,
      providerName: provider.name,
      visibility,
      reconnectingConnectedAccountId: connection.id,
    });
  };

  const getConfirmation = (
    visibility: 'user' | 'workspace',
  ): AddConnectionConfirmation => {
    const existingConnection =
      providerConnections.length === 1 ? providerConnections[0] : undefined;

    if (!isDefined(existingConnection)) {
      const connectionNames = providerConnections
        .map((connection) => getConnectionName(connection))
        .join(', ');

      return {
        title: t`You already have ${providerConnections.length} ${provider.displayName} connections`,
        subtitle: t`Already connected: ${connectionNames}.`,
        confirmButtonText: t`Connect a different account`,
        onConfirmClick: () => connectAnotherAccount(visibility),
        onConnectAnotherAccount: null,
      };
    }

    const existingConnectionName = getConnectionName(existingConnection);
    const existingConnectionVisibility =
      getConnectionVisibility(existingConnection);

    if (existingConnectionVisibility === visibility) {
      return {
        title:
          visibility === 'workspace'
            ? t`You already have a shared ${provider.displayName} connection`
            : t`You already have a ${provider.displayName} connection`,
        subtitle:
          visibility === 'workspace'
            ? t`${existingConnectionName} is shared with the workspace.`
            : t`${existingConnectionName}, connected just for you.`,
        confirmButtonText: t`Reconnect ${existingConnectionName}`,
        onConfirmClick: () =>
          reconnectExistingConnection({
            connection: existingConnection,
            visibility,
          }),
        onConnectAnotherAccount: () => connectAnotherAccount(visibility),
      };
    }

    if (visibility === 'workspace') {
      return {
        title: t`Share your existing connection, or connect another account?`,
        subtitle: t`${existingConnectionName} is connected just for you. Sharing it requires authorizing again, so make sure you are signed in to ${provider.displayName} as the same account.`,
        confirmButtonText: t`Reconnect and share ${existingConnectionName}`,
        onConfirmClick: () =>
          reconnectExistingConnection({
            connection: existingConnection,
            visibility: 'workspace',
          }),
        onConnectAnotherAccount: () => connectAnotherAccount(visibility),
      };
    }

    return {
      title: t`You already have a shared ${provider.displayName} connection`,
      subtitle: t`${existingConnectionName} is shared with the workspace. Connecting again adds a separate connection just for you.`,
      confirmButtonText: t`Connect an account just for me`,
      onConfirmClick: () => connectAnotherAccount(visibility),
      onConnectAnotherAccount: null,
    };
  };

  const handlePick = (visibility: 'user' | 'workspace') => {
    if (providerConnections.length === 0) {
      connectAnotherAccount(visibility);
      return;
    }

    setConfirmation(getConfirmation(visibility));
    openModal(modalId);
  };

  return (
    <>
      <AddConnectionDropdown provider={provider} onPick={handlePick} />
      {isDefined(confirmation) && (
        <ConfirmationModal
          modalInstanceId={modalId}
          title={confirmation.title}
          subtitle={confirmation.subtitle}
          onConfirmClick={confirmation.onConfirmClick}
          confirmButtonText={confirmation.confirmButtonText}
          confirmButtonAccent="blue"
          AdditionalButtons={
            isDefined(confirmation.onConnectAnotherAccount) ? (
              <StyledCenteredButton
                title={t`Connect a different account`}
                variant="secondary"
                fullWidth
                justify="center"
                onClick={() => {
                  closeModal(modalId);
                  confirmation.onConnectAnotherAccount?.();
                }}
              />
            ) : undefined
          }
        />
      )}
    </>
  );
};

export const SettingsApplicationConnectionsSection = ({
  applicationId,
}: {
  applicationId: string;
}) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const { connectionProviders, loading } =
    useFindApplicationConnectionProviders(applicationId);
  const { accounts: connectedAccounts } = useMyAppConnectedAccounts();

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
          (account) => account.connectionProviderId === provider.id,
        );

        return (
          <Section key={provider.id}>
            <H2Title
              title={provider.displayName}
              description={t`Manage connections used by this app to call ${provider.displayName}.`}
              adornment={
                <Avatar
                  type="app"
                  avatarUrl={getAbsoluteImageUrl(provider.logoUrl)}
                  placeholder={provider.displayName}
                />
              }
            />
            {isOAuth && !isClientCredentialsConfigured && (
              <Info
                accent="danger"
                text={t`${provider.displayName} OAuth is not yet set up by your server administrator. They need to fill in the OAuth client ID and secret on the application registration before you can add a connection.`}
              />
            )}
            {providerConnections.length > 0 && (
              <Table>
                <TableRow
                  gridTemplateColumns={
                    CONNECTION_TABLE_ROW_GRID_TEMPLATE_COLUMNS
                  }
                >
                  <TableHeader>{t`Connection`}</TableHeader>
                  <TableHeader>{t`Status`}</TableHeader>
                  <TableHeader>{t`Visibility`}</TableHeader>
                  <TableHeader />
                </TableRow>
                <StyledTableRowsContainer>
                  {providerConnections.map((connection) => (
                    <TableRow
                      key={connection.id}
                      gridTemplateColumns={
                        CONNECTION_TABLE_ROW_GRID_TEMPLATE_COLUMNS
                      }
                      to={getSettingsPath(
                        SettingsPath.ApplicationConnectionDetail,
                        {
                          applicationId,
                          connectedAccountId: connection.id,
                        },
                      )}
                    >
                      <TableCell
                        clickable
                        minWidth="0"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                      >
                        {getConnectionName(connection)}
                      </TableCell>
                      <TableCell clickable>
                        {connection.authFailedAt ? (
                          <Status color="red" text={t`Reconnect needed`} />
                        ) : (
                          <Status color="green" text={t`Connected`} />
                        )}
                      </TableCell>
                      <TableCell clickable>
                        <Status
                          color={
                            connection.visibility === 'workspace'
                              ? 'blue'
                              : 'gray'
                          }
                          text={
                            connection.visibility === 'workspace'
                              ? t`Workspace shared`
                              : t`Just for me`
                          }
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        color={themeCssVariables.font.color.tertiary}
                        padding={`0 ${themeCssVariables.spacing[2]} 0 0`}
                      >
                        <IconChevronRight
                          size={theme.icon.size.md}
                          stroke={theme.icon.stroke.sm}
                          color={theme.font.color.light}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </StyledTableRowsContainer>
              </Table>
            )}
            {isClientCredentialsConfigured && (
              <StyledFooter>
                <AddConnectionAction
                  applicationId={applicationId}
                  provider={provider}
                  providerConnections={providerConnections}
                />
              </StyledFooter>
            )}
          </Section>
        );
      })}
    </>
  );
};
