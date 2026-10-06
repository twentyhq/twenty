import { type ComponentType } from 'react';
import { type SettingsPath } from 'twenty-shared/types';

export type PreinstalledApplicationId =
  | 'gmail'
  | 'google-calendar'
  | 'outlook'
  | 'imap-smtp-caldav';

// Google, Microsoft and IMAP/SMTP/CalDAV are not applications yet. Until they
// become real apps, the app preferences page presents them as preinstalled ones.
export type PreinstalledApplication = {
  id: PreinstalledApplicationId;
  name: string;
  typeLabel: string;
  Icon: ComponentType<{ size?: number }>;
  settingsPath: SettingsPath;
};
