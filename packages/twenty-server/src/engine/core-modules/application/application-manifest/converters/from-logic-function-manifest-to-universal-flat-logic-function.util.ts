import { parse } from 'path';

import { isNonEmptyString } from '@sniptt/guards';
import { type LogicFunctionManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { isPackagedApplicationSource } from 'src/engine/core-modules/application/application-registration/utils/is-packaged-application-source.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import {
  LogicFunctionExecutionMode,
  LogicFunctionRuntime,
} from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type UniversalFlatLogicFunction } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-logic-function.type';

const resolveExecutionMode = ({
  logicFunctionManifest,
  applicationSourceType,
  existingFlatLogicFunctionMaps,
  isPrebuiltModeEnabled,
}: {
  logicFunctionManifest: LogicFunctionManifest;
  applicationSourceType: ApplicationRegistrationSourceType;
  existingFlatLogicFunctionMaps: AllFlatEntityMaps['flatLogicFunctionMaps'];
  isPrebuiltModeEnabled: boolean;
}): LogicFunctionExecutionMode => {
  const existingFlatLogicFunction = findFlatEntityByUniversalIdentifier({
    flatEntityMaps: existingFlatLogicFunctionMaps,
    universalIdentifier: logicFunctionManifest.universalIdentifier,
  });

  if (isDefined(existingFlatLogicFunction)) {
    if (
      existingFlatLogicFunction.executionMode ===
        LogicFunctionExecutionMode.PREBUILT &&
      !isNonEmptyString(logicFunctionManifest.builtHandlerChecksum)
    ) {
      return LogicFunctionExecutionMode.LIVE;
    }

    return existingFlatLogicFunction.executionMode;
  }

  if (
    isPrebuiltModeEnabled &&
    isPackagedApplicationSource(applicationSourceType) &&
    isNonEmptyString(logicFunctionManifest.builtHandlerChecksum)
  ) {
    return LogicFunctionExecutionMode.PREBUILT;
  }

  return LogicFunctionExecutionMode.LIVE;
};

export const fromLogicFunctionManifestToUniversalFlatLogicFunction = ({
  logicFunctionManifest,
  applicationUniversalIdentifier,
  applicationSourceType,
  existingFlatLogicFunctionMaps,
  isPrebuiltModeEnabled,
  now,
}: {
  logicFunctionManifest: LogicFunctionManifest;
  applicationUniversalIdentifier: string;
  applicationSourceType: ApplicationRegistrationSourceType;
  existingFlatLogicFunctionMaps: AllFlatEntityMaps['flatLogicFunctionMaps'];
  isPrebuiltModeEnabled: boolean;
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
    executionMode: resolveExecutionMode({
      logicFunctionManifest,
      applicationSourceType,
      existingFlatLogicFunctionMaps,
      isPrebuiltModeEnabled,
    }),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
