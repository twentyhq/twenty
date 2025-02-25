import { GraphQLPlayground } from '@/settings/playground/components/GraphQLPlayground';
import { PlaygroundSchemas } from '@/settings/playground/components/PlaygroundSetupForm';
import { SettingsPath } from '@/types/SettingsPath';

import { FullScreenContainer } from '@/ui/layout/fullscreen/components/FullScreenContainer';
import { Trans } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsGraphQLPlayground = () => {
  const navigateSettings = useNavigateSettings();

  const handleExitFullScreen = () => {
    navigateSettings(SettingsPath.APIs);
  };

  const { schema } = useParams<{
    schema: PlaygroundSchemas;
  }>();

  if (!isDefined(schema)) {
    handleExitFullScreen();
    return null;
  }

  return (
    <FullScreenContainer
      exitFullScreen={handleExitFullScreen}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: <Trans>APIs</Trans>,
          href: getSettingsPath(SettingsPath.APIs),
        },
        { children: <Trans>GraphQL API Playground</Trans> },
      ]}
    >
      <GraphQLPlayground schema={schema} />
    </FullScreenContainer>
  );
};
