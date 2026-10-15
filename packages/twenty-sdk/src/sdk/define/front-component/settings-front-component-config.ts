import { type FrontComponentConfig } from '@/sdk/define/front-component/front-component-config';

// A settings front component always renders visible UI, so `isHeadless`
// is not configurable.
export type SettingsFrontComponentConfig = Omit<
  FrontComponentConfig,
  'isHeadless'
>;
