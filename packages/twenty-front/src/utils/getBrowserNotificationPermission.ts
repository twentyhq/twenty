export const getBrowserNotificationPermission = ():
  | NotificationPermission
  | 'unsupported' =>
  typeof Notification === 'undefined' || /Android/i.test(navigator.userAgent)
    ? 'unsupported'
    : Notification.permission;
