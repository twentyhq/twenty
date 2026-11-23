export type SystemNotificationSettings = {
  operatingSystem: 'mac' | 'windows' | 'other';
  browserName?: string;
  settingsEntryName?: string;
  url?: string;
};
