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

const getInboxPath = (url) =>
  typeof url === 'string' && url.startsWith('/inbox/') ? url : undefined;

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const inboxPath = getInboxPath(event.notification.data?.url);

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(([windowClient]) => {
        if (windowClient === undefined) {
          return self.clients.openWindow(inboxPath ?? '/');
        }

        if (inboxPath !== undefined) {
          windowClient.postMessage({
            type: 'push-notification-click',
            url: inboxPath,
          });
        }

        return windowClient.focus();
      }),
  );
});
