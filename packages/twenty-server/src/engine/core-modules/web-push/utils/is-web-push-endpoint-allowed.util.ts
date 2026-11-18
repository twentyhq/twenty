import { isDefined } from 'twenty-shared/utils';

const WEB_PUSH_SERVICE_HOSTNAMES = [
  'fcm.googleapis.com',
  'updates.push.services.mozilla.com',
  'web.push.apple.com',
];

const WEB_PUSH_SERVICE_HOSTNAME_SUFFIXES = ['.notify.windows.com'];

export const isWebPushEndpointAllowed = (endpoint: string): boolean => {
  const endpointUrl = URL.parse(endpoint);

  if (!isDefined(endpointUrl)) {
    return false;
  }

  const { protocol, hostname, port } = endpointUrl;

  return (
    protocol === 'https:' &&
    port === '' &&
    (WEB_PUSH_SERVICE_HOSTNAMES.includes(hostname) ||
      WEB_PUSH_SERVICE_HOSTNAME_SUFFIXES.some((hostnameSuffix) =>
        hostname.endsWith(hostnameSuffix),
      ))
  );
};
