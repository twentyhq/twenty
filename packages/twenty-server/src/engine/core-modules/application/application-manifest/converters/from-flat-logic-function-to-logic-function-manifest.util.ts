import { type LogicFunctionManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { printDatabaseEventTriggerSettings } from 'src/engine/workspace-event-emitter/utils/print-database-event-trigger-settings.util';

export const fromFlatLogicFunctionToLogicFunctionManifest = ({
  logicFunction,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  logicFunction: FlatLogicFunction;
} & Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
>): LogicFunctionManifest | undefined => {
  if (!isDefined(logicFunction.checksum)) {
    return undefined;
  }
  return {
    universalIdentifier: logicFunction.universalIdentifier,
    name: logicFunction.name,
    ...(isDefined(logicFunction.description)
      ? { description: logicFunction.description }
      : {}),
    timeoutSeconds: logicFunction.timeoutSeconds,
    ...(isDefined(logicFunction.retryLimit)
      ? { retryLimit: logicFunction.retryLimit }
      : {}),
    ...(isDefined(logicFunction.jobFailureHandlerName)
      ? { jobFailureHandlerName: logicFunction.jobFailureHandlerName }
      : {}),
    sourceHandlerPath: logicFunction.sourceHandlerPath,
    builtHandlerPath: logicFunction.builtHandlerPath,
    builtHandlerChecksum: logicFunction.checksum,
    handlerName: logicFunction.handlerName,
    ...(isDefined(logicFunction.cronTriggerSettings)
      ? { cronTriggerSettings: logicFunction.cronTriggerSettings }
      : {}),
    ...(isDefined(logicFunction.databaseEventTriggerSettings)
      ? {
          databaseEventTriggerSettings: printDatabaseEventTriggerSettings({
            settings: logicFunction.databaseEventTriggerSettings,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
          }),
        }
      : {}),
    ...(isDefined(logicFunction.httpRouteTriggerSettings)
      ? { httpRouteTriggerSettings: logicFunction.httpRouteTriggerSettings }
      : {}),
    ...(isDefined(logicFunction.serverRouteTriggerSettings)
      ? { serverRouteTriggerSettings: logicFunction.serverRouteTriggerSettings }
      : {}),
    ...(isDefined(logicFunction.toolTriggerSettings)
      ? { toolTriggerSettings: logicFunction.toolTriggerSettings }
      : {}),
    ...(isDefined(logicFunction.workflowActionTriggerSettings)
      ? {
          workflowActionTriggerSettings:
            logicFunction.workflowActionTriggerSettings,
        }
      : {}),
  };
};
