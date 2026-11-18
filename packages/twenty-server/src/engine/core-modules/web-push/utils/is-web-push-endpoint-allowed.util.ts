import { WEB_PUSH_SERVICE_HOSTS } from 'src/engine/core-modules/web-push/constants/web-push-service-hosts.constant';

export const isWebPushEndpointAllowed = (endpoint: string): boolean => {
  if (!URL.canParse(endpoint)) {
    return false;
  }

  const { protocol, hostname, port } = new URL(endpoint);

  return (
    protocol === 'https:' &&
    port === '' &&
    WEB_PUSH_SERVICE_HOSTS.some((host) =>
      host.startsWith('*.')
        ? hostname.endsWith(host.slice(1))
        : hostname === host,
    )
  );
};
