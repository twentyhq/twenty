export const createBrowserNotification = ({
  title,
  options,
}: {
  title: string;
  options: NotificationOptions;
}): Notification | null => {
  try {
    return new Notification(title, options);
  } catch (error) {
    if (error instanceof TypeError) {
      return null;
    }

    throw error;
  }
};
