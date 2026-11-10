import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAppPreferencesRemoveConnectionDialog } from '@/settings/app-preferences/components/SettingsAppPreferencesRemoveConnectionDialog';
import { SettingsApplicationConnectionName } from '@/settings/applications/components/SettingsApplicationConnectionName';
import { SettingsApplicationApiKeyConnectionDialog } from '@/settings/applications/components/SettingsApplicationApiKeyConnectionDialog';
import { useStartApplicationConnection } from '@/settings/applications/hooks/useStartApplicationConnection';
import { type ConnectableApplicationConnectionProvider } from '@/settings/applications/types/ConnectableApplicationConnectionProvider';
import { isApplicationConnectionReconnectNeeded } from '@/settings/applications/utils/isApplicationConnectionReconnectNeeded';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical, IconRefresh, IconTrash } from 'twenty-ui/icon';

type SettingsAppPreferencesConnectionRowDropdownMenuProps = {
  applicationId: string;
  connectionProvider: ConnectableApplicationConnectionProvider;
  connection: ConnectedAccount;
  canStartAuthorization: boolean;
  reconnectRedirectLocation: string;
};

export const SettingsAppPreferencesConnectionRowDropdownMenu = ({
  applicationId,
  connectionProvider,
  connection,
  canStartAuthorization,
  reconnectRedirectLocation,
}: SettingsAppPreferencesConnectionRowDropdownMenuProps) => {
  const { t } = useLingui();
  const { startApplicationConnection } = useStartApplicationConnection();
  const { openDialog } = useDialog();
  const removeDialogId = `remove-app-connection-modal-${connection.id}`;

  return (
    <>
      <DropdownRoot
        type="menu"
        dropdownId={`settings-app-connection-row-${connection.id}`}
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
            {canStartAuthorization &&
              isApplicationConnectionReconnectNeeded(connection) && (
                <Dropdown.ActionItem
                  startIcon={<IconRefresh />}
                  onClick={() =>
                    startApplicationConnection({
                      applicationId,
                      connectionProvider,
                      reconnectingConnectedAccountId: connection.id,
                      redirectLocation: reconnectRedirectLocation,
                    })
                  }
                >{t`Reconnect`}</Dropdown.ActionItem>
              )}
            <Dropdown.ActionItem
              color="danger"
              startIcon={<IconTrash />}
              onClick={() => openDialog(removeDialogId)}
            >{t`Remove`}</Dropdown.ActionItem>
          </Dropdown.Section>
        </DropdownContent>
      </DropdownRoot>
      <SettingsApplicationApiKeyConnectionDialog
        applicationId={applicationId}
        connectionProvider={connectionProvider}
        reconnectingConnectedAccountId={connection.id}
      />
      <SettingsAppPreferencesRemoveConnectionDialog
        dialogId={removeDialogId}
        connectedAccountId={connection.id}
        connectionLabel={
          <SettingsApplicationConnectionName connection={connection} />
        }
      />
    </>
  );
};
