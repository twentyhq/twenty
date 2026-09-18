import { type FrontComponentConfig } from '@/sdk/define/front-component/front-component-config';
import { type FrontComponentSettingsTabManifest } from 'twenty-shared/application';

export type SettingsFrontComponentConfig = Omit<
  FrontComponentConfig,
  'isHeadless'
> & {
  tab?: FrontComponentSettingsTabManifest;
};
