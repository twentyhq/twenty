import { isDefined } from 'twenty-shared/utils';

import { matchesDatabaseEventTriggerEventName } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/utils/matches-database-event-trigger-event-name.util';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export const filterLogicFunctionsWithMatchingDatabaseEventTrigger = ({
  flatLogicFunctionMaps,
  batchEventName,
}: {
  flatLogicFunctionMaps: WorkspaceCacheDataMap['flatLogicFunctionMaps'];
  batchEventName: string;
}) =>
  Object.values(flatLogicFunctionMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (logicFunction) =>
        !isDefined(logicFunction.deletedAt) &&
        isDefined(logicFunction.databaseEventTriggerSettings) &&
        matchesDatabaseEventTriggerEventName({
          batchEventName,
          triggerEventName:
            logicFunction.databaseEventTriggerSettings.eventName,
        }),
    );
