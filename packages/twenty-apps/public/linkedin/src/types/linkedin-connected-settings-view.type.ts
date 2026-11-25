import { type LinkedinSettingsView } from 'src/types/linkedin-settings-view.type';

export type LinkedinConnectedSettingsView = Extract<
  LinkedinSettingsView,
  { isConnected: true }
>;
