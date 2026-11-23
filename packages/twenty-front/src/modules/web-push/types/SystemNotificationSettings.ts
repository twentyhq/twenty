export type SystemNotificationSettings =
  | {
      operatingSystem: 'mac' | 'windows';
      browserName?: string;
      settingsEntryName?: string;
      url: string;
    }
  | { operatingSystem: 'other'; browserName?: string };
