import { UNSUBSCRIBE_HOSTNAME_PREFIX } from 'src/engine/core-modules/emailing-domain/constants/unsubscribe-hostname-prefix.constant';

export const buildLogDriverUnsubscribeBaseUrl = ({
  serverUrl,
  isMultiWorkspaceEnabled,
  subdomain,
}: {
  serverUrl: string;
  isMultiWorkspaceEnabled: boolean;
  subdomain: string;
}): string => {
  const baseUrl = new URL(serverUrl);

  baseUrl.hostname = isMultiWorkspaceEnabled
    ? `${UNSUBSCRIBE_HOSTNAME_PREFIX}.${subdomain}.${baseUrl.hostname}`
    : `${UNSUBSCRIBE_HOSTNAME_PREFIX}.${baseUrl.hostname}`;

  return baseUrl.origin;
};
