import {
  PLAYGROUND_API_KEY,
  PlaygroundSchemas,
} from '@/settings/playground/components/PlaygroundSetupForm';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import '@graphiql/plugin-explorer/dist/style.css';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';
import 'graphiql/graphiql.css';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

type GraphQLPlaygroundProps = {
  schema: PlaygroundSchemas;
};

const SchemaToPath = {
  [PlaygroundSchemas.CORE]: 'graphql',
  [PlaygroundSchemas.METADATA]: 'metadata',
};

export const GraphQLPlayground = ({ schema }: GraphQLPlaygroundProps) => {
  const apiKey = sessionStorage.getItem(PLAYGROUND_API_KEY);
  const baseUrl = REACT_APP_SERVER_BASE_URL;
  const path = SchemaToPath[schema];

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
