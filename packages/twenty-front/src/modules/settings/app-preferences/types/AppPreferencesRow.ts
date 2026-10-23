import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';

export type AppPreferencesRow =
  | { type: 'builtIn'; id: string; builtInAccountApp: BuiltInAccountApp }
  | {
      type: 'installed';
      id: string;
      applicationWithPreferences: ApplicationWithPreferences;
    };
