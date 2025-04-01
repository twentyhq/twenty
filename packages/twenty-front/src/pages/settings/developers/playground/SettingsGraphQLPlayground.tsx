import { GraphQLPlayground } from '@/settings/playground/components/GraphQLPlayground';
import { PlaygroundSchemas } from '@/settings/playground/types/PlaygroundSchemas';
import { SettingsPath } from '@/types/SettingsPath';

import { FullScreenContainer } from '@/ui/layout/fullscreen/components/FullScreenContainer';
import { Trans } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsGraphQLPlayground = () => {
  const navigateSettings = useNavigateSettings();
  const { schema: urlSchema = 'core' } = useParams<{ schema: string }>();

  // Convert lowercase URL parameter to PlaygroundSchemas enum
  const schema =
    urlSchema === 'metadata'
      ? PlaygroundSchemas.METADATA
      : PlaygroundSchemas.CORE;

  const handleExitFullScreen = () => {
    navigateSettings(SettingsPath.APIs);
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
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: <Trans>APIs</Trans>,
          href: getSettingsPath(SettingsPath.APIs),
        },
        { children: <Trans>GraphQL API Playground</Trans> },
      ]}
    >
      <GraphQLPlayground onError={handleOnError} schema={schema} />
    </FullScreenContainer>
  );
};
