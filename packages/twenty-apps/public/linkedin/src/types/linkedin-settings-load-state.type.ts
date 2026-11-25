import { type LinkedinSettingsView } from 'src/types/linkedin-settings-view.type';

export type LinkedinSettingsLoadState =
  | { step: 'loading' }
  | { step: 'unavailable' }
  | { step: 'ready'; view: LinkedinSettingsView };
