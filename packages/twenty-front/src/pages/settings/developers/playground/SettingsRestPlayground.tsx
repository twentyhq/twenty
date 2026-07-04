import { RestPlayground } from '@/settings/mcp-and-apis/components/RestPlayground';
import { PlaygroundSchemas } from '@/settings/mcp-and-apis/types/PlaygroundSchemas';
import { FullScreenContainer } from '@/ui/layout/fullscreen/components/FullScreenContainer';
import { Trans } from '@lingui/react/macro';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SETTINGS_API_WEBHOOKS_TABS } from '~/pages/settings/api-webhooks/constants/SettingsApiWebhooksTabs';

export const SettingsRestPlayground = () => {
  const navigateSettings = useNavigateSettings();
  const { schema = PlaygroundSchemas.CORE } = useParams<{
    schema: PlaygroundSchemas;
  }>();

  const handleExitFullScreen = () => {
    navigateSettings(
      SettingsPath.ApiWebhooks,
      undefined,
      undefined,
      undefined,
      SETTINGS_API_WEBHOOKS_TABS.TABS_IDS.API,
    );
  };

  const handleError = useCallback(() => {
    navigateSettings(
      SettingsPath.ApiWebhooks,
      undefined,
      undefined,
      undefined,
      SETTINGS_API_WEBHOOKS_TABS.TABS_IDS.API,
    );
  }, [navigateSettings]);

  return (
    <FullScreenContainer
      exitFullScreen={handleExitFullScreen}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: <Trans>MCP & APIs</Trans>,
          href: getSettingsPath(
            SettingsPath.ApiWebhooks,
            undefined,
            undefined,
            SETTINGS_API_WEBHOOKS_TABS.TABS_IDS.API,
          ),
        },
        { children: <Trans>REST</Trans> },
      ]}
    >
      <RestPlayground schema={schema} onError={handleError} />
    </FullScreenContainer>
  );
};
