import { type PreInstallLogicFunctionConfig } from '@/sdk/define/logic-functions/pre-install-logic-function-config';
import { type WithTranslatableProperties } from '@/sdk/define/common/types/translatable-text.type';

export type PostInstallLogicFunctionConfig = PreInstallLogicFunctionConfig & {
  shouldRunSynchronously?: boolean;
};

export type TranslatablePostInstallLogicFunctionConfig =
  WithTranslatableProperties<
    PostInstallLogicFunctionConfig,
    'name' | 'description'
  >;
