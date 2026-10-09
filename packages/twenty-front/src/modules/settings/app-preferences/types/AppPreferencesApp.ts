import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { type NativeAccountApp } from '@/settings/app-preferences/types/NativeAccountApp';

export type AppPreferencesApp =
  | { type: 'native'; id: string; nativeAccountApp: NativeAccountApp }
  | {
      type: 'installed';
      id: string;
      applicationWithPreferences: ApplicationWithPreferences;
    };
