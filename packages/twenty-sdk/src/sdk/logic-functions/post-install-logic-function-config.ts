import { type PreInstallLogicFunctionConfig } from '@/sdk/logic-functions/pre-install-logic-function-config';

export type PostInstallLogicFunctionConfig = PreInstallLogicFunctionConfig & {
  shouldRunSynchronously?: boolean;
};
