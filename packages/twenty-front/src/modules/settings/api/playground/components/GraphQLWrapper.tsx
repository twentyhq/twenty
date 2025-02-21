import { PlaygroundSchemas } from '@/settings/api/playground/form/ApiPlaygroundSetupForm';
import styled from '@emotion/styled';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import '@graphiql/plugin-explorer/dist/style.css';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';
import 'graphiql/graphiql.css';
import { useState } from 'react';

const StyledContainer = styled.div`
  height: 100%;
`;

const SchemaToPath = {
  [PlaygroundSchemas.CORE]: 'graphql',
  [PlaygroundSchemas.METADATA]: 'metadata',
};

const GraphQlComponent = ({ token, baseUrl, path }: any) => {
  const explorer = explorerPlugin({
    showAttribution: true,
  });

  const fetcher = createGraphiQLFetcher({
    url: baseUrl + '/' + path,
  });

  if (!baseUrl || !token) {
    return <></>;
  }

  return (
    <StyledContainer>
      <GraphiQL
        plugins={[explorer]}
        fetcher={fetcher}
        defaultHeaders={JSON.stringify({ Authorization: `Bearer ${token}` })}
      />
    </StyledContainer>
  );
};

const GraphQLWrapper = ({ schema }: { schema: PlaygroundSchemas }) => {
  const [token, setToken] = useState<string>();
  const [baseUrl, setBaseUrl] = useState<string>();

  return (
      <GraphQlComponent
        token={token}
        baseUrl={baseUrl}
        path={SchemaToPath[schema]}
      />
  );
};
export default GraphQLWrapper;
