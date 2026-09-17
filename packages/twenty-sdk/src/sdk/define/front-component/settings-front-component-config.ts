import { type FrontComponentConfig } from '@/sdk/define/front-component/front-component-config';
import { type FrontComponentSettingsTabManifest } from 'twenty-shared/application';

// A settings front component always renders visible UI, so `isHeadless`
// is not configurable. `settingsTab` is derived from `tab` at build time,
// so that declaring a settings tab always goes through this define function.
export type SettingsFrontComponentConfig = Omit<
  FrontComponentConfig,
  'isHeadless' | 'settingsTab'
> & {
  tab?: FrontComponentSettingsTabManifest;
};
