import { apiKeyState } from '@/settings/playground/states/apiKeyState';
import { PlaygroundSchemas } from '@/settings/playground/types/PlaygroundConfig';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import '@graphiql/plugin-explorer/dist/style.css';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { isValid } from 'date-fns';
import { GraphiQL } from 'graphiql';
import 'graphiql/graphiql.css';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { ThemeContext } from 'twenty-ui';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

type GraphQLPlaygroundProps = {
  onError(): void;
  schema: PlaygroundSchemas;
};

export const schemaToPath = {
  [PlaygroundSchemas.CORE]: 'graphql',
  [PlaygroundSchemas.METADATA]: 'metadata',
};

export const GraphQLPlayground = ({
  onError,
  schema,
}: GraphQLPlaygroundProps) => {
  const apiKey = useRecoilValue(apiKeyState);
  const baseUrl = REACT_APP_SERVER_BASE_URL + '/' + schemaToPath[schema];

  const { theme } = useContext(ThemeContext);

  if (!isValid) {
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
    <GraphiQL
      forcedTheme={theme.name as 'light' | 'dark'}
      plugins={[explorer]}
      fetcher={fetcher}
      defaultHeaders={JSON.stringify({ Authorization: `Bearer ${apiKey}` })}
    />
  );
};
