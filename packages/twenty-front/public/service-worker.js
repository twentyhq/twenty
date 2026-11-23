self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

const hasVisibleWindowClient = async () =>
  (
    await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  ).some((windowClient) => windowClient.visibilityState === 'visible');

const updateAppBadge = async (badgeCount) => {
  if (
    typeof badgeCount !== 'number' ||
    !('setAppBadge' in self.navigator) ||
    (await hasVisibleWindowClient())
  ) {
    return;
  }

  return badgeCount > 0
    ? self.navigator.setAppBadge(badgeCount)
    : self.navigator.clearAppBadge();
};

self.addEventListener('push', (event) => {
  const { title, body, url, tag, renotify, badgeCount } = event.data.json();

  event.waitUntil(updateAppBadge(badgeCount).catch(console.error));

  event.waitUntil(
    self.registration
      .getNotifications({ tag })
      .then((displayedNotifications) => {
        const messageCount =
          displayedNotifications.reduce(
            (count, notification) =>
              Math.max(count, notification.data?.messageCount ?? 1),
            0,
          ) + 1;

        if (renotify) {
          displayedNotifications.forEach((notification) =>
            notification.close(),
          );
        }

        return self.registration.showNotification(
          messageCount > 1 ? `${title} (${messageCount})` : title,
          {
            body,
            tag,
            renotify,
            icon: '/images/icons/android/android-launchericon-192-192.png',
            data: { url, messageCount },
          },
        );
      }),
  );
});

const getPathToOpenOnClick = (url) =>
  typeof url === 'string' && url.startsWith('/inbox/') ? url : '/';

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.openWindow(getPathToOpenOnClick(event.notification.data?.url)),
  );
});
