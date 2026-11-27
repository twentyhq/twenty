import { isDefined } from 'twenty-shared/utils';

import { isLogicFunctionWarmEligible } from 'src/engine/core-modules/logic-function/logic-function-warm-up/utils/is-logic-function-warm-eligible.util';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

type KeepWarmCandidate = Pick<
  FlatLogicFunction,
  | 'id'
  | 'applicationId'
  | 'deletedAt'
  | 'keepWarm'
  | 'executionMode'
  | 'isBuildUpToDate'
  | 'checksum'
>;

export const findLogicFunctionIdsToKeepWarm = ({
  flatLogicFunctions,
  isApplicationActive,
}: {
  flatLogicFunctions: (KeepWarmCandidate | undefined)[];
  isApplicationActive: (applicationId: string) => boolean;
}): string[] =>
  flatLogicFunctions
    .filter(isDefined)
    .filter(
      (flatLogicFunction) =>
        !isDefined(flatLogicFunction.deletedAt) &&
        isLogicFunctionWarmEligible(flatLogicFunction) &&
        isApplicationActive(flatLogicFunction.applicationId),
    )
    .map((flatLogicFunction) => flatLogicFunction.id);
