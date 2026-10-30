import { RestPlayground } from '@/settings/developers/components/RestPlayground';
import { PlaygroundSchemas } from '@/settings/developers/types/PlaygroundSchemas';
import { FullScreenContainer } from '@/ui/layout/fullscreen/components/FullScreenContainer';
import { Trans } from '@lingui/react/macro';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SETTINGS_DEVELOPERS_TABS } from '@/settings/developers/constants/SettingsDevelopersTabs';

export const SettingsRestPlayground = () => {
  const navigateSettings = useNavigateSettings();
  const { schema = PlaygroundSchemas.CORE } = useParams<{
    schema: PlaygroundSchemas;
  }>();

  const handleExitFullScreen = () => {
    navigateSettings(
      SettingsPath.Developers,
      undefined,
      undefined,
      undefined,
      SETTINGS_DEVELOPERS_TABS.TABS_IDS.API,
    );
  };

  const handleError = useCallback(() => {
    navigateSettings(
      SettingsPath.Developers,
      undefined,
      undefined,
      undefined,
      SETTINGS_DEVELOPERS_TABS.TABS_IDS.API,
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
          children: <Trans>Developers</Trans>,
          href: getSettingsPath(
            SettingsPath.Developers,
            undefined,
            undefined,
            SETTINGS_DEVELOPERS_TABS.TABS_IDS.API,
          ),
        },
        { children: <Trans>REST</Trans> },
      ]}
    >
      <RestPlayground schema={schema} onError={handleError} />
    </FullScreenContainer>
  );
};
