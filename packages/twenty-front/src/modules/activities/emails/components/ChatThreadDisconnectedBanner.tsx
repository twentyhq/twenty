import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { useTriggerAppOAuth } from '@/settings/applications/hooks/useTriggerAppOAuth';
import { Button } from 'twenty-ui/primitives/input';
import { IconRefresh } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledBanner = styled.div`
  align-items: center;
  background: ${themeCssVariables.color.red};
  color: ${themeCssVariables.font.color.inverted};
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: center;
  padding: ${themeCssVariables.spacing[2]};
`;

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
    <StyledBanner role="alert">
      {t`${channelName} is disconnected.`}
      <Button
        variant="outline"
        size="sm"
        startIcon={<IconRefresh />}
        onClick={handleReconnect}
      >{t`Reconnect`}</Button>
    </StyledBanner>
  );
};
