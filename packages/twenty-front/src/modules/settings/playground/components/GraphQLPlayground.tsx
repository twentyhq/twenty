import { playgroundApiKeyState } from '@/settings/playground/states/playgroundApiKeyState';
import { PlaygroundSchemas } from '@/settings/playground/types/PlaygroundSchemas';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import '@graphiql/plugin-explorer/dist/style.css';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';
import 'graphiql/graphiql.css';
import { useContext } from 'react';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

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

  const { colorScheme } = useContext(ThemeContext);

  if (!playgroundApiKey) {
    onError();
    return null;
  }

  const explorer = explorerPlugin({
    showAttribution: true,
  });

  const fetcher = createGraphiQLFetcher({
    url: baseUrl,
  });

  return (
    <StyledGraphiQLContainer>
      <GraphiQL
        forcedTheme={colorScheme}
        plugins={[explorer]}
        fetcher={fetcher}
        defaultHeaders={JSON.stringify({
          Authorization: `Bearer ${playgroundApiKey}`,
        })}
      />
    </StyledGraphiQLContainer>
  );
};
