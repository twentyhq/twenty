import { type PreInstallLogicFunctionConfig } from '@/sdk/define/logic-functions/pre-install-logic-function-config';

export type PostInstallLogicFunctionConfig = PreInstallLogicFunctionConfig & {
  shouldRunSynchronously?: boolean;
};
