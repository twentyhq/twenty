const WEB_PUSH_SERVICE_HOSTS = [
  'fcm.googleapis.com',
  '*.notify.windows.com',
  'updates.push.services.mozilla.com',
  'web.push.apple.com',
];

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
