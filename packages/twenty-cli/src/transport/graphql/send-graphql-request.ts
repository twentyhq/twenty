import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { createTargetFetch } from '@/transport/create-target-fetch';
import { GRAPHQL_ENDPOINT_PATHS } from '@/transport/graphql/constants/graphql-endpoint-paths.constant';
import { parseGraphqlResponse } from '@/transport/graphql/parse-graphql-response';
import { type GraphqlEndpoint } from '@/transport/graphql/types/graphql-endpoint.type';
import { resolveRequestUrl } from '@/transport/resolve-request-url';

export const sendGraphqlRequest = async ({
  target,
  signal,
  endpoint,
  query,
  variables,
}: {
  target: ResolvedTarget;
  signal: AbortSignal;
  endpoint: GraphqlEndpoint;
  query: string;
  variables?: Record<string, unknown>;
}) => {
  const response = await createTargetFetch({ target, signal })(
    resolveRequestUrl({
      apiUrl: target.apiUrl,
      path: GRAPHQL_ENDPOINT_PATHS[endpoint],
    }),
    {
      method: 'POST',
      headers: {
        Accept: 'application/graphql-response+json, application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    },
  );
  const payload = await parseGraphqlResponse({ response, target });

  return payload.data ?? null;
};
