import { parse } from 'path';

import { isNonEmptyString } from '@sniptt/guards';
import { type LogicFunctionManifest } from 'twenty-shared/application';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import {
  LogicFunctionExecutionMode,
  LogicFunctionRuntime,
} from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type UniversalFlatLogicFunction } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-logic-function.type';

// Packaged sources (tarball, npm) ship an immutable build, so their functions
// run the prebuilt bundle installed at sync time. Local-source apps are edited
// live during development and keep fetching the latest build on each execution.
const computeExecutionModeForApplicationSource = ({
  applicationSourceType,
  builtHandlerChecksum,
}: {
  applicationSourceType: ApplicationRegistrationSourceType;
  builtHandlerChecksum: string | undefined;
}): LogicFunctionExecutionMode => {
  const isPackagedSource =
    applicationSourceType === ApplicationRegistrationSourceType.TARBALL ||
    applicationSourceType === ApplicationRegistrationSourceType.NPM;

  if (isPackagedSource && isNonEmptyString(builtHandlerChecksum)) {
    return LogicFunctionExecutionMode.PREBUILT;
  }

  return LogicFunctionExecutionMode.LIVE;
};

export const fromLogicFunctionManifestToUniversalFlatLogicFunction = ({
  logicFunctionManifest,
  applicationUniversalIdentifier,
  applicationSourceType,
  now,
}: {
  logicFunctionManifest: LogicFunctionManifest;
  applicationUniversalIdentifier: string;
  applicationSourceType: ApplicationRegistrationSourceType;
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
    cronTriggerSettings: logicFunctionManifest.cronTriggerSettings ?? null,
    databaseEventTriggerSettings:
      logicFunctionManifest.databaseEventTriggerSettings ?? null,
    httpRouteTriggerSettings:
      logicFunctionManifest.httpRouteTriggerSettings ?? null,
    serverRouteTriggerSettings:
      logicFunctionManifest.serverRouteTriggerSettings ?? null,
    toolTriggerSettings: logicFunctionManifest.toolTriggerSettings ?? null,
    workflowActionTriggerSettings:
      logicFunctionManifest.workflowActionTriggerSettings ?? null,
    isBuildUpToDate: true,
    executionMode: computeExecutionModeForApplicationSource({
      applicationSourceType,
      builtHandlerChecksum: logicFunctionManifest.builtHandlerChecksum,
    }),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
