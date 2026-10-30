import { useLingui } from '@lingui/react/macro';

import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useTriggerAppOAuth } from '@/settings/applications/hooks/useTriggerAppOAuth';
import { IconRefresh } from 'twenty-ui/icon';

type ChatThreadDisconnectedBannerProps = {
  applicationId: string;
  connectionProviderName: string;
  channelName: string;
  connectedAccountId: string;
};

export const ChatThreadDisconnectedBanner = ({
  applicationId,
  connectionProviderName,
  channelName,
  connectedAccountId,
}: ChatThreadDisconnectedBannerProps) => {
  const { t } = useLingui();
  const { triggerAppOAuth } = useTriggerAppOAuth();

  const handleReconnect = () =>
    triggerAppOAuth({
      applicationId,
      providerName: connectionProviderName,
      reconnectingConnectedAccountId: connectedAccountId,
      redirectLocation: window.location.pathname,
    });

  return (
    <InformationBanner
      componentInstanceId={`chat-thread-disconnected-${connectedAccountId}`}
      status="error"
      message={t`${channelName} is disconnected.`}
      buttonTitle={t`Reconnect`}
      buttonIcon={IconRefresh}
      buttonOnClick={handleReconnect}
    />
  );
};
