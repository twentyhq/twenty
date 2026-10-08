import { isDefined } from 'twenty-shared/utils';

import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type FlatLogicFunctionMaps } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function-maps.type';
import { computeTriggerEventNamesMatchingEvent } from 'src/engine/workspace-event-emitter/utils/compute-trigger-event-names-matching-event.util';

export const findLogicFunctionsTriggeredByEventName = ({
  flatLogicFunctionMaps,
  eventName,
}: {
  flatLogicFunctionMaps: FlatLogicFunctionMaps;
  eventName: string;
}): FlatLogicFunction[] => {
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
