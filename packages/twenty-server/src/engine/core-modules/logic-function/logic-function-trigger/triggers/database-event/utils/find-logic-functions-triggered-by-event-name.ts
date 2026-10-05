import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { findDatabaseEventTriggersMatchingEventName } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/utils/find-database-event-triggers-matching-event-name';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type FlatLogicFunctionMaps } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function-maps.type';

export const findLogicFunctionsTriggeredByEventName = ({
  flatLogicFunctionMaps,
  eventName,
}: {
  flatLogicFunctionMaps: FlatLogicFunctionMaps;
  eventName: string;
}): FlatLogicFunction[] => {
  return Object.values(flatLogicFunctionMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (logicFunction) =>
        !isDefined(logicFunction.deletedAt) &&
        isNonEmptyArray(
          findDatabaseEventTriggersMatchingEventName({
            databaseEventTriggerSettings:
              logicFunction.databaseEventTriggerSettings,
            eventName,
          }),
        ),
    );
};
