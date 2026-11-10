import { useTriggerAppOAuth } from '@/settings/applications/hooks/useTriggerAppOAuth';
import { type ConnectableApplicationConnectionProvider } from '@/settings/applications/types/ConnectableApplicationConnectionProvider';
import { getApplicationApiKeyConnectionDialogId } from '@/settings/applications/utils/getApplicationApiKeyConnectionDialogId';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';

export const useStartApplicationConnection = () => {
  const { triggerAppOAuth } = useTriggerAppOAuth();
  const { openDialog } = useDialog();

  const startApplicationConnection = ({
    applicationId,
    connectionProvider,
    reconnectingConnectedAccountId,
    redirectLocation,
  }: {
    applicationId: string;
    connectionProvider: ConnectableApplicationConnectionProvider;
    reconnectingConnectedAccountId?: string;
    redirectLocation?: string;
  }) => {
    if (connectionProvider.type === 'apiKey') {
      openDialog(
        getApplicationApiKeyConnectionDialogId({
          applicationId,
          providerName: connectionProvider.name,
          reconnectingConnectedAccountId,
        }),
      );

      return;
    }

    triggerAppOAuth({
      applicationId,
      providerName: connectionProvider.name,
      reconnectingConnectedAccountId,
      redirectLocation,
    });
  };

  return { startApplicationConnection };
};
