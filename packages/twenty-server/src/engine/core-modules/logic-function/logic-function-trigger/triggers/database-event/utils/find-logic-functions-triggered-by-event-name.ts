import { isDefined } from 'twenty-shared/utils';

import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type FlatLogicFunctionMaps } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function-maps.type';

export const findLogicFunctionsTriggeredByEventName = ({
  flatLogicFunctionMaps,
  eventName,
}: {
  flatLogicFunctionMaps: FlatLogicFunctionMaps;
  eventName: string;
}): FlatLogicFunction[] => {
  const [nameSingular, operation] = eventName.split('.');

  const matchingTriggerEventNames = [
    `${nameSingular}.${operation}`,
    `*.${operation}`,
    `${nameSingular}.*`,
    '*.*',
  ];

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
