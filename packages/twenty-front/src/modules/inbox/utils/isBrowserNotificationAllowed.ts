import { isPageNotificationSupported } from '~/utils/isPageNotificationSupported';

export const isBrowserNotificationAllowed = (): boolean =>
  isPageNotificationSupported() && Notification.permission === 'granted';
