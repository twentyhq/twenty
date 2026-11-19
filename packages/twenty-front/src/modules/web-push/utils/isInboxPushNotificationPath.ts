export const isInboxPushNotificationPath = (url: unknown): url is string =>
  typeof url === 'string' && url.startsWith('/inbox/');
