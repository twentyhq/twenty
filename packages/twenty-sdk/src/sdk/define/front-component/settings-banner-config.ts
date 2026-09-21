import { type FrontComponentConfig } from '@/sdk/define/front-component/front-component-config';

// A settings banner component only drives the host banner, it never renders
// its own UI, so `isHeadless` is forced on and not configurable.
export type SettingsBannerConfig = Omit<FrontComponentConfig, 'isHeadless'>;
