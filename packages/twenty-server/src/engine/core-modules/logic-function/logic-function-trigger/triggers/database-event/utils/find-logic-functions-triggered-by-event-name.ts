import { isDefined } from 'twenty-shared/utils';

import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { computeTriggerEventNamesMatchingEvent } from 'src/engine/workspace-event-emitter/utils/compute-trigger-event-names-matching-event.util';

export const findLogicFunctionsTriggeredByEventName = <
  TLogicFunction extends Pick<
    FlatLogicFunction,
    'deletedAt' | 'databaseEventTriggerSettings'
  >,
>({
  flatLogicFunctionMaps,
  eventName,
}: {
  flatLogicFunctionMaps: {
    byUniversalIdentifier: Partial<Record<string, TLogicFunction>>;
  };
  eventName: string;
}): TLogicFunction[] => {
  const matchingTriggerEventNames =
    computeTriggerEventNamesMatchingEvent(eventName);

  return Object.values(flatLogicFunctionMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (logicFunction) =>
        !isDefined(logicFunction.deletedAt) &&
        isDefined(logicFunction.databaseEventTriggerSettings) &&
        matchingTriggerEventNames.includes(
          logicFunction.databaseEventTriggerSettings.eventName,
        ),
    );
};
