export const getBrowserNotificationPermission = ():
  | NotificationPermission
  | 'unsupported' =>
  typeof Notification === 'undefined' ||
  !('serviceWorker' in navigator) ||
  !('PushManager' in window)
    ? 'unsupported'
    : Notification.permission;
