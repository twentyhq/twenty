import { isDefined } from 'twenty-shared/utils';

const WEB_PUSH_SERVICES: {
  isHostnameAllowed: (hostname: string) => boolean;
  pathnamePrefixes: string[];
}[] = [
  {
    isHostnameAllowed: (hostname) => hostname === 'fcm.googleapis.com',
    pathnamePrefixes: ['/fcm/send/', '/wp/'],
  },
  {
    isHostnameAllowed: (hostname) =>
      hostname === 'updates.push.services.mozilla.com',
    pathnamePrefixes: ['/wpush/'],
  },
  {
    isHostnameAllowed: (hostname) => hostname === 'web.push.apple.com',
    pathnamePrefixes: ['/'],
  },
  {
    isHostnameAllowed: (hostname) => hostname.endsWith('.notify.windows.com'),
    pathnamePrefixes: ['/w/'],
  },
];

export const isWebPushEndpointAllowed = (endpoint: string): boolean => {
  const endpointUrl = URL.parse(endpoint);

  if (!isDefined(endpointUrl)) {
    return false;
  }

  const { protocol, username, password, port, hash, hostname, pathname } =
    endpointUrl;

  if (
    protocol !== 'https:' ||
    username !== '' ||
    password !== '' ||
    port !== '' ||
    hash !== ''
  ) {
    return false;
  }

  return WEB_PUSH_SERVICES.some(
    ({ isHostnameAllowed, pathnamePrefixes }) =>
      isHostnameAllowed(hostname) &&
      pathnamePrefixes.some((pathnamePrefix) =>
        pathname.startsWith(pathnamePrefix),
      ),
  );
};
