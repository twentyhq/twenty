import { type LogicFunctionManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export const fromFlatLogicFunctionToLogicFunctionManifest = (
  logicFunction: FlatLogicFunction,
): LogicFunctionManifest | undefined => {
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
    sourceHandlerPath: logicFunction.sourceHandlerPath,
    builtHandlerPath: logicFunction.builtHandlerPath,
    builtHandlerChecksum: logicFunction.checksum,
    handlerName: logicFunction.handlerName,
    ...(isDefined(logicFunction.cronTriggerSettings)
      ? { cronTriggerSettings: logicFunction.cronTriggerSettings }
      : {}),
    ...(isDefined(logicFunction.databaseEventTriggerSettings)
      ? {
          databaseEventTriggerSettings:
            logicFunction.databaseEventTriggerSettings,
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
