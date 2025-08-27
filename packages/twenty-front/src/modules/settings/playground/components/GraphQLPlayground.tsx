import { playgroundApiKeyState } from '@/settings/playground/states/playgroundApiKeyState';
import { PlaygroundSchemas } from '@/settings/playground/types/PlaygroundSchemas';
import styled from '@emotion/styled';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import '@graphiql/plugin-explorer/dist/style.css';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';
import 'graphiql/graphiql.css';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { ThemeContext } from 'twenty-ui/theme';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

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
    background: ${({ theme }) => theme.background.primary};
    border-radius: ${({ theme }) => theme.border.radius.md};
  }
`;

export const GraphQLPlayground = ({
  onError,
  schema,
}: GraphQLPlaygroundProps) => {
  const playgroundApiKey = useRecoilValue(playgroundApiKeyState);
  const baseUrl = REACT_APP_SERVER_BASE_URL + '/' + schemaToPath[schema];

  const { theme } = useContext(ThemeContext);

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
        forcedTheme={theme.name as 'light' | 'dark'}
        plugins={[explorer]}
        fetcher={fetcher}
        defaultHeaders={JSON.stringify({
          Authorization: `Bearer ${playgroundApiKey}`,
        })}
      />
    </StyledGraphiQLContainer>
  );
};
