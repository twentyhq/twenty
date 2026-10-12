import { type LogicFunctionConfig } from '@/app/manifest/types/logic-function-config.type';
import { type LogicFunctionManifest } from 'twenty-shared/application';
import {
  getInputSchemaFromSourceCode,
  jsonSchemaToInputSchema,
} from 'twenty-shared/logic-function';

export const fromLogicFunctionConfigToLogicFunctionManifest = async ({
  logicFunctionConfig,
  sourceCode,
  sourcePath,
}: {
  logicFunctionConfig: LogicFunctionConfig;
  sourceCode: string;
  sourcePath: string;
}): Promise<LogicFunctionManifest> => {
  const { handler: _, ...rest } = logicFunctionConfig;

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
    sourceHandlerPath: sourcePath,
    builtHandlerPath: sourcePath.replace(/\.tsx?$/, '.mjs'),
    builtHandlerChecksum: '[default-checksum]',
  };
};
