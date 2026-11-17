export const createBrowserNotification = (
  title: string,
  options: NotificationOptions,
): Notification | null => {
  try {
    return new Notification(title, options);
  } catch {
    return null;
  }
};
