import { PlaygroundSchemas } from '@/settings/playground/components/PlaygroundSetupForm';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import '@graphiql/plugin-explorer/dist/style.css';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { Trans } from '@lingui/react/macro';
import { GraphiQL } from 'graphiql';
import 'graphiql/graphiql.css';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledContainer = styled.div`
  height: 100%;
`;

const StyledPlaygroundContainer = styled.div`
  height: 100vh;
  position: relative;
  width: 100vw;
`;

const SchemaToPath = {
  [PlaygroundSchemas.CORE.toLocaleLowerCase()]: 'graphql',
  [PlaygroundSchemas.METADATA.toLocaleLowerCase()]: 'metadata',
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
    <StyledContainer>
      <GraphiQL
        forcedTheme={theme.name as 'light' | 'dark'}
        plugins={[explorer]}
        fetcher={fetcher}
        defaultHeaders={JSON.stringify({ Authorization: `Bearer ${apiKey}` })}
      />
    </StyledContainer>
  );
};

export const GraphQLPlayground = ({ schema }: { schema: PlaygroundSchemas }) => {
  const apiKey = sessionStorage.getItem('apiKey');
  const baseUrl = REACT_APP_SERVER_BASE_URL;

  return (
    <SubMenuTopBarContainer
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
      <StyledPlaygroundContainer>
        <GraphQlComponent
          apiKey={apiKey}
          baseUrl={baseUrl}
          path={SchemaToPath[schema]}
        />
      </StyledPlaygroundContainer>
    </SubMenuTopBarContainer>
  );
};
