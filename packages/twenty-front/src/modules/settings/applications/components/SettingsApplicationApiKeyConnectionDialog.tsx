import { SettingsApplicationApiKeyConnectionDialogContent } from '@/settings/applications/components/SettingsApplicationApiKeyConnectionDialogContent';
import { type ConnectableApplicationConnectionProvider } from '@/settings/applications/types/ConnectableApplicationConnectionProvider';
import { getApplicationApiKeyConnectionDialogId } from '@/settings/applications/utils/getApplicationApiKeyConnectionDialogId';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';

type SettingsApplicationApiKeyConnectionDialogProps = {
  applicationId: string;
  connectionProvider: ConnectableApplicationConnectionProvider;
  reconnectingConnectedAccountId?: string;
};

export const SettingsApplicationApiKeyConnectionDialog = ({
  applicationId,
  connectionProvider,
  reconnectingConnectedAccountId,
}: SettingsApplicationApiKeyConnectionDialogProps) => {
  if (connectionProvider.type !== 'apiKey') {
    return null;
  }

  const dialogId = getApplicationApiKeyConnectionDialogId({
    applicationId,
    providerName: connectionProvider.name,
    reconnectingConnectedAccountId,
  });

  return (
    <DialogInstance dialogId={dialogId} dismissible renderInDocumentBody>
      {({ onKeyDown }) => (
        <SettingsApplicationApiKeyConnectionDialogContent
          dialogId={dialogId}
          onKeyDown={onKeyDown}
          applicationId={applicationId}
          connectionProvider={connectionProvider}
          reconnectingConnectedAccountId={reconnectingConnectedAccountId}
        />
      )}
    </DialogInstance>
  );
};
