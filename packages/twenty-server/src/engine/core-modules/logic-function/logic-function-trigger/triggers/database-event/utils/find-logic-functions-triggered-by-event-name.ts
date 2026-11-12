import { isDefined } from 'twenty-shared/utils';

import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { isDatabaseEventTriggerListeningToEvent } from 'src/engine/workspace-event-emitter/utils/is-database-event-trigger-listening-to-event.util';

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
}): TLogicFunction[] =>
  Object.values(flatLogicFunctionMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (logicFunction) =>
        !isDefined(logicFunction.deletedAt) &&
        isDefined(logicFunction.databaseEventTriggerSettings) &&
        isDatabaseEventTriggerListeningToEvent({
          triggerEventName:
            logicFunction.databaseEventTriggerSettings.eventName,
          eventName,
        }),
    );
