import { type LogicFunctionConfig } from '@/app/manifest/types/logic-function-config.type';
import { type LogicFunctionManifest } from 'twenty-shared/application';
import {
  getInputSchemaFromSourceCode,
  jsonSchemaToInputSchema,
} from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';

export const fromLogicFunctionConfigToLogicFunctionManifest = async ({
  logicFunctionConfig,
  sourceCode,
  sourcePath,
}: {
  logicFunctionConfig: LogicFunctionConfig;
  sourceCode: string;
  sourcePath: string;
}): Promise<LogicFunctionManifest> => {
  const { handler: _, onJobFailure, ...rest } = logicFunctionConfig;

  const inferredJsonSchema =
    (rest.toolTriggerSettings && !rest.toolTriggerSettings.inputSchema) ||
    (rest.workflowActionTriggerSettings &&
      !rest.workflowActionTriggerSettings.inputSchema)
      ? await getInputSchemaFromSourceCode(sourceCode)
      : null;

  const toolTriggerSettings = rest.toolTriggerSettings
    ? {
        ...rest.toolTriggerSettings,
        inputSchema:
          rest.toolTriggerSettings.inputSchema ??
          inferredJsonSchema ??
          undefined,
      }
    : undefined;

  const workflowActionTriggerSettings = rest.workflowActionTriggerSettings
    ? {
        ...rest.workflowActionTriggerSettings,
        inputSchema:
          rest.workflowActionTriggerSettings.inputSchema ??
          (inferredJsonSchema
            ? jsonSchemaToInputSchema(inferredJsonSchema)
            : undefined),
      }
    : undefined;

  return {
    ...rest,
    ...(toolTriggerSettings ? { toolTriggerSettings } : {}),
    ...(workflowActionTriggerSettings ? { workflowActionTriggerSettings } : {}),
    handlerName: 'default.config.handler',
    ...(isDefined(onJobFailure)
      ? { jobFailureHandlerName: 'default.config.onJobFailure' }
      : {}),
    sourceHandlerPath: sourcePath,
    builtHandlerPath: sourcePath.replace(/\.tsx?$/, '.mjs'),
    builtHandlerChecksum: '[default-checksum]',
  };
};
