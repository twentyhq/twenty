// Android browsers only show notifications sent from a service worker:
// `new Notification()` throws there even when permission is granted
export const isPageNotificationSupported = (): boolean =>
  typeof Notification !== 'undefined' && !/Android/i.test(navigator.userAgent);
