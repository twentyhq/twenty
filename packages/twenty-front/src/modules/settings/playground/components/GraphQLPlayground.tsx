import { PlaygroundSchemas } from '@/settings/playground/components/PlaygroundSetupForm';
import { SettingsPath } from '@/types/SettingsPath';
import { FullScreenContainer } from '@/ui/layout/fullscreen/components/FullScreenContainer';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import '@graphiql/plugin-explorer/dist/style.css';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { Trans } from '@lingui/react/macro';
import { GraphiQL } from 'graphiql';
import 'graphiql/graphiql.css';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const SchemaToPath = {
  [PlaygroundSchemas.CORE]: 'graphql',
  [PlaygroundSchemas.METADATA]: 'metadata',
};

const GraphQlComponent = ({ apiKey, baseUrl, path }: any) => {
  const { theme } = useContext(ThemeContext);

  const explorer = explorerPlugin({
    showAttribution: true,
  });

  const fetcher = createGraphiQLFetcher({
    url: baseUrl + '/' + path,
  });

  if (!baseUrl || !apiKey) {
    return <></>;
  }

  return (
    <GraphiQL
      forcedTheme={theme.name as 'light' | 'dark'}
      plugins={[explorer]}
      fetcher={fetcher}
      defaultHeaders={JSON.stringify({ Authorization: `Bearer ${apiKey}` })}
    />
  );
};

export const GraphQLPlayground = ({
  schema,
}: {
  schema: PlaygroundSchemas;
}) => {
  const apiKey = sessionStorage.getItem('apiKey');
  const baseUrl = REACT_APP_SERVER_BASE_URL;
  const navigateSettings = useNavigateSettings();

  const handleExitFullScreen = () => {
    navigateSettings(SettingsPath.APIs);
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
      <GraphQlComponent
        apiKey={apiKey}
        baseUrl={baseUrl}
        path={SchemaToPath[schema]}
      />
    </FullScreenContainer>
  );
};
