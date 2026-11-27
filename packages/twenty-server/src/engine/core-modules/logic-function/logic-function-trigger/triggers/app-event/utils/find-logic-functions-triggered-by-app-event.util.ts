import { isDefined } from 'twenty-shared/utils';

import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

// Only the emitting app's functions, so an event never runs another app's code
export const findLogicFunctionsTriggeredByAppEvent = <
  TLogicFunction extends Pick<
    FlatLogicFunction,
    'deletedAt' | 'applicationId' | 'appEventTriggerSettings'
  >,
>({
  flatLogicFunctionMaps,
  applicationId,
  eventUniversalIdentifier,
}: {
  flatLogicFunctionMaps: {
    byUniversalIdentifier: Partial<Record<string, TLogicFunction>>;
  };
  applicationId: string;
  eventUniversalIdentifier: string;
}): TLogicFunction[] =>
  Object.values(flatLogicFunctionMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (logicFunction) =>
        !isDefined(logicFunction.deletedAt) &&
        logicFunction.applicationId === applicationId &&
        logicFunction.appEventTriggerSettings?.eventUniversalIdentifier ===
          eventUniversalIdentifier,
    );
