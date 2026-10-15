import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { CliError } from '@/output/cli-error';
import { API_URL_PROTOCOLS } from '@/target/constants/api-url-protocols.constant';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { createBoundedFetch } from '@/transport/create-target-fetch';
import { createMetadataClient } from '@/transport/metadata/create-metadata-client';
import { parseResponseBody } from '@/transport/parse-response-body';
import { resolveRequestUrl } from '@/transport/resolve-request-url';

const parseWorkspaceUrl = (value: unknown, apiUrl: string) => {
  const url = isNonEmptyString(value) ? URL.parse(value) : null;

  if (!isDefined(url) || !API_URL_PROTOCOLS.includes(url.protocol)) {
    throw new CliError({
      code: 'INVALID_RESPONSE',
      message: `${apiUrl} did not return a web address for this workspace.`,
    });
  }

  return url;
};

export const fetchWorkspaceUrl = async ({
  target,
  signal,
}: {
  target: ResolvedTarget;
  signal: AbortSignal;
}) => {
  const client = createMetadataClient({ target, signal });
  const { currentWorkspace } = await client.query({
    currentWorkspace: {
      workspaceUrls: { customUrl: true, subdomainUrl: true },
    },
  });
  const urls = currentWorkspace?.workspaceUrls;
  const workspaceUrl = isNonEmptyString(urls?.customUrl)
    ? urls.customUrl
    : urls?.subdomainUrl;

  if (isNonEmptyString(workspaceUrl)) {
    return parseWorkspaceUrl(workspaceUrl, target.apiUrl);
  }

  const response = await createBoundedFetch({ apiUrl: target.apiUrl, signal })(
    resolveRequestUrl({
      apiUrl: target.apiUrl,
      path: '/.well-known/oauth-authorization-server',
    }),
    { headers: { Accept: 'application/json' } },
  );
  const metadata = await parseResponseBody(response);
  const authorizationEndpoint = parseWorkspaceUrl(
    response.ok && isPlainObject(metadata)
      ? metadata.authorization_endpoint
      : undefined,
    target.apiUrl,
  );

  return new URL(authorizationEndpoint.origin);
};
