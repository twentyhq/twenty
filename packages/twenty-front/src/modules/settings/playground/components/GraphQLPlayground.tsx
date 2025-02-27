import { usePlaygroundSession } from '@/settings/playground/hooks/usePlaygroundSession';
import { PlaygroundSchemas } from '@/settings/playground/types/PlaygroundConfig';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import '@graphiql/plugin-explorer/dist/style.css';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';
import 'graphiql/graphiql.css';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

type GraphQLPlaygroundProps = {
  onError(): void;
};

const SchemaToPath = {
  [PlaygroundSchemas.CORE]: 'graphql',
  [PlaygroundSchemas.METADATA]: 'metadata',
};

export const GraphQLPlayground = ({ onError }: GraphQLPlaygroundProps) => {
  const { apiKey, schema, isValid } = usePlaygroundSession();

  const { theme } = useContext(ThemeContext);

  if (!isValid) {
    onError();
    return null;
  }

  const baseUrl = REACT_APP_SERVER_BASE_URL + '/' + SchemaToPath[schema];

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
