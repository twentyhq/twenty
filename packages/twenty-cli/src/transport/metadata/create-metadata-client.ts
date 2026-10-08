import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { createTargetFetch } from '@/transport/create-target-fetch';
import { GRAPHQL_ENDPOINT_PATHS } from '@/transport/graphql/constants/graphql-endpoint-paths.constant';
import { parseGraphqlResponse } from '@/transport/graphql/parse-graphql-response';
import { resolveRequestUrl } from '@/transport/resolve-request-url';

export const createMetadataClient = ({
  target,
  signal,
  timeoutMilliseconds,
}: {
  target: ResolvedTarget;
  signal: AbortSignal;
  timeoutMilliseconds?: number;
}) => {
  const targetFetch = createTargetFetch({
    target,
    signal,
    timeoutMilliseconds,
  });

  const fetchValidGraphqlResponse: typeof fetch = async (input, init) => {
    const response = await targetFetch(input, init);

    await parseGraphqlResponse({ response: response.clone(), target });

    return response;
  };

  return new MetadataApiClient({
    url: resolveRequestUrl({
      apiUrl: target.apiUrl,
      path: GRAPHQL_ENDPOINT_PATHS.metadata,
    }).href,
    headers: { Authorization: `Bearer ${target.bearerToken}` },
    fetch: fetchValidGraphqlResponse,
  });
};
