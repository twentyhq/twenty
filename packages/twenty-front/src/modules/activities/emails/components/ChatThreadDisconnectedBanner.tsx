import { useLingui } from '@lingui/react/macro';

import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useStartAppConnection } from '@/settings/applications/hooks/useStartAppConnection';
import { IconRefresh } from 'twenty-ui/icon';

type ChatThreadDisconnectedBannerProps = {
  applicationId: string;
  connectionProviderName: string;
  connectionProviderType: string;
  channelName: string;
  connectedAccountId: string;
  canReconnect: boolean;
};

export const ChatThreadDisconnectedBanner = ({
  applicationId,
  connectionProviderName,
  connectionProviderType,
  channelName,
  connectedAccountId,
  canReconnect,
}: ChatThreadDisconnectedBannerProps) => {
  const { t } = useLingui();
  const { startAppConnection } = useStartAppConnection();

  const handleReconnect = () =>
    startAppConnection({
      applicationId,
      connectionProviderName,
      connectionProviderType,
      reconnectingConnectedAccountId: connectedAccountId,
      redirectLocation: `${window.location.pathname}${window.location.search}${window.location.hash}`,
    });

  return (
    <InformationBanner
      componentInstanceId={`chat-thread-disconnected-${connectedAccountId}`}
      status="error"
      message={t`${channelName} is disconnected.`}
      buttonTitle={canReconnect ? t`Reconnect` : undefined}
      buttonIcon={IconRefresh}
      buttonOnClick={canReconnect ? handleReconnect : undefined}
    />
  );
};
