import {
  isPlaygroundApiKeyFresh,
  playgroundApiKeyState,
} from '@/settings/mcp-and-apis/states/playgroundApiKeyState';
import { PlaygroundSchemas } from '@/settings/mcp-and-apis/types/PlaygroundSchemas';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import '@graphiql/plugin-explorer/style.css';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';
import { useMemo } from 'react';
import 'graphiql/style.css';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useThemeColorScheme, themeCssVariables } from 'twenty-ui/theme';

type GraphQLPlaygroundProps = {
  onError(): void;
  schema: PlaygroundSchemas;
};

export const schemaToPath = {
  [PlaygroundSchemas.CORE]: 'graphql',
  [PlaygroundSchemas.METADATA]: 'metadata',
};

const StyledGraphiQLContainer = styled.div`
  height: 100%;
  width: 100%;

  .graphiql-container {
    background: ${themeCssVariables.background.primary};
    border-radius: ${themeCssVariables.border.radius.md};
  }
`;

export const GraphQLPlayground = ({
  onError,
  schema,
}: GraphQLPlaygroundProps) => {
  const playgroundApiKey = useAtomStateValue(playgroundApiKeyState);
  const baseUrl = REACT_APP_SERVER_BASE_URL + '/' + schemaToPath[schema];

  const colorScheme = useThemeColorScheme();
  const token = playgroundApiKey?.token;

  // GraphiQL re-runs schema introspection whenever it receives a new fetcher
  const fetcher = useMemo(
    () =>
      createGraphiQLFetcher({
        url: baseUrl,
        headers: { Authorization: `Bearer ${token}` },
      }),
    [baseUrl, token],
  );
  const explorer = useMemo(() => explorerPlugin({ showAttribution: true }), []);

  if (!isPlaygroundApiKeyFresh(playgroundApiKey)) {
    onError();
    return null;
  }

  return (
    <StyledGraphiQLContainer>
      <GraphiQL
        forcedTheme={colorScheme}
        plugins={[explorer]}
        fetcher={fetcher}
        defaultHeaders={JSON.stringify({
          Authorization: `Bearer ${playgroundApiKey.token}`,
        })}
      />
    </StyledGraphiQLContainer>
  );
};
