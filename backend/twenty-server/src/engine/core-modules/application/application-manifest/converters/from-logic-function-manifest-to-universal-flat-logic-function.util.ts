import { parse } from 'path';

import { type LogicFunctionManifest } from 'twenty-shared/application';

import { LogicFunctionRuntime } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type UniversalFlatLogicFunction } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-logic-function.type';

export const fromLogicFunctionManifestToUniversalFlatLogicFunction = ({
  logicFunctionManifest,
  applicationUniversalIdentifier,
  now,
}: {
  logicFunctionManifest: LogicFunctionManifest;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatLogicFunction => {
  const name =
    logicFunctionManifest.name ?? parse(logicFunctionManifest.handlerName).name;

  return {
    universalIdentifier: logicFunctionManifest.universalIdentifier,
    applicationUniversalIdentifier,
    name,
    description: logicFunctionManifest.description ?? null,
    runtime: LogicFunctionRuntime.NODE22,
    timeoutSeconds: logicFunctionManifest.timeoutSeconds ?? 300,
    sourceHandlerPath: logicFunctionManifest.sourceHandlerPath,
    builtHandlerPath: logicFunctionManifest.builtHandlerPath,
    handlerName: logicFunctionManifest.handlerName,
    checksum: logicFunctionManifest.builtHandlerChecksum,
    toolInputSchema: logicFunctionManifest.toolInputSchema,
    isTool: logicFunctionManifest.isTool ?? false,
    cronTriggerSettings: logicFunctionManifest.cronTriggerSettings ?? null,
    databaseEventTriggerSettings:
      logicFunctionManifest.databaseEventTriggerSettings ?? null,
    httpRouteTriggerSettings:
      logicFunctionManifest.httpRouteTriggerSettings ?? null,
    isBuildUpToDate: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
