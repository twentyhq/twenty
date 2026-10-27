import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAppPreferencesRemoveConnectionDialog } from '@/settings/app-preferences/components/SettingsAppPreferencesRemoveConnectionDialog';
import { SettingsApplicationConnectionName } from '@/settings/applications/components/SettingsApplicationConnectionName';
import { getApplicationPreferencesConnectionsPath } from '@/settings/app-preferences/utils/getApplicationPreferencesConnectionsPath';
import { useTriggerAppOAuth } from '@/settings/applications/hooks/useTriggerAppOAuth';
import { canReconnectApplicationConnection } from '@/settings/applications/utils/canReconnectApplicationConnection';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical, IconRefresh, IconTrash } from 'twenty-ui/icon';

type SettingsAppPreferencesConnectionRowDropdownMenuProps = {
  applicationId: string;
  providerName: string;
  connection: ConnectedAccount;
  isClientCredentialsConfigured: boolean;
};

export const SettingsAppPreferencesConnectionRowDropdownMenu = ({
  applicationId,
  providerName,
  connection,
  isClientCredentialsConfigured,
}: SettingsAppPreferencesConnectionRowDropdownMenuProps) => {
  const { t } = useLingui();
  const { triggerAppOAuth } = useTriggerAppOAuth();
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
            {canReconnectApplicationConnection({
              connection,
              isClientCredentialsConfigured,
            }) && (
              <Dropdown.ActionItem
                startIcon={<IconRefresh />}
                onClick={() =>
                  triggerAppOAuth({
                    applicationId,
                    providerName,
                    reconnectingConnectedAccountId: connection.id,
                    redirectLocation:
                      getApplicationPreferencesConnectionsPath(applicationId),
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
