// Android browsers only show notifications sent from a service worker:
// `new Notification()` throws there even when permission is granted
export const getBrowserNotificationPermission = ():
  | NotificationPermission
  | 'unsupported' =>
  typeof Notification === 'undefined' || /Android/i.test(navigator.userAgent)
    ? 'unsupported'
    : Notification.permission;
