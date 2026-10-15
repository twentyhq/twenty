import { type WithTranslatableProperties } from '@/sdk/define/common/types/translatable-text.type';
import { type FrontComponentConfig } from '@/sdk/define/front-component/front-component-config';

// A settings front component always renders visible UI, so `isHeadless`
// is not configurable.
export type SettingsFrontComponentConfig = Omit<
  FrontComponentConfig,
  'isHeadless'
>;

export type TranslatableSettingsFrontComponentConfig =
  WithTranslatableProperties<
    SettingsFrontComponentConfig,
    'name' | 'description'
  >;
