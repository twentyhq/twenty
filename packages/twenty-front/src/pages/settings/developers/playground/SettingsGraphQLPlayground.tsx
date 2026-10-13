import { GraphQLPlayground } from '@/settings/mcp-and-apis/components/GraphQLPlayground';
import { PlaygroundSchemas } from '@/settings/mcp-and-apis/types/PlaygroundSchemas';
import { SettingsPath } from 'twenty-shared/types';

import { FullScreenContainer } from '@/ui/layout/fullscreen/components/FullScreenContainer';
import { Trans } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { getSettingsPath } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsGraphQLPlayground = () => {
  const navigateSettings = useNavigateSettings();
  const { schema: urlSchema = 'core' } = useParams<{ schema: string }>();

  const schema =
    urlSchema === 'metadata'
      ? PlaygroundSchemas.METADATA
      : PlaygroundSchemas.CORE;

  const handleExitFullScreen = () => {
    navigateSettings(SettingsPath.ApiWebhooks);
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
          children: <Trans>APIs</Trans>,
          href: getSettingsPath(SettingsPath.ApiWebhooks),
        },
        { children: <Trans>GraphQL API Playground</Trans> },
      ]}
    >
      <GraphQLPlayground onError={handleOnError} schema={schema} />
    </FullScreenContainer>
  );
};
