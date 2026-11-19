export const getBrowserNotificationPermission = ():
  | NotificationPermission
  | 'unsupported' => {
  const isWebPushSupported =
    typeof Notification !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window;

  return isWebPushSupported ? Notification.permission : 'unsupported';
};
