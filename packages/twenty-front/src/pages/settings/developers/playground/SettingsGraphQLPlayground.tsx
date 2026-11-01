import { GraphQLPlayground } from '@/settings/developers/components/GraphQLPlayground';
import { PlaygroundSchemas } from '@/settings/developers/types/PlaygroundSchemas';
import { SettingsPath } from 'twenty-shared/types';

import { FullScreenContainer } from '@/ui/layout/fullscreen/components/FullScreenContainer';
import { Trans } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { getSettingsPath } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SETTINGS_DEVELOPERS_TABS } from '@/settings/developers/constants/SettingsDevelopersTabs';

export const SettingsGraphQLPlayground = () => {
  const navigateSettings = useNavigateSettings();
  const { schema: urlSchema = 'core' } = useParams<{ schema: string }>();

  const schema =
    urlSchema === 'metadata'
      ? PlaygroundSchemas.METADATA
      : PlaygroundSchemas.CORE;

  const handleExitFullScreen = () => {
    navigateSettings(
      SettingsPath.Developers,
      undefined,
      undefined,
      undefined,
      SETTINGS_DEVELOPERS_TABS.TABS_IDS.API,
    );
  };

  const handleOnError = () => {
    handleExitFullScreen();
  };

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
        { children: <Trans>GraphQL API Playground</Trans> },
      ]}
    >
      <GraphQLPlayground onError={handleOnError} schema={schema} />
    </FullScreenContainer>
  );
};
