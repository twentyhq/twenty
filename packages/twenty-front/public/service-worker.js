self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  const { title, body, url, tag, renotify } = event.data.json();

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
