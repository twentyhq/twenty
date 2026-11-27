import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { isLogicFunctionReadyForPrebuiltInstall } from 'src/engine/metadata-modules/logic-function/utils/is-logic-function-ready-for-prebuilt-install.util';

// Only an installed prebuilt bundle can be loaded by a warm-up ping, so LIVE functions are never warmed nor charged for it.
export const isLogicFunctionWarmEligible = (
  flatLogicFunction: Pick<
    FlatLogicFunction,
    'keepWarm' | 'executionMode' | 'isBuildUpToDate' | 'checksum'
  >,
): boolean =>
  flatLogicFunction.keepWarm &&
  isLogicFunctionReadyForPrebuiltInstall(flatLogicFunction);
