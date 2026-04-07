import { type FlexibleSchema } from '@ai-sdk/provider-utils';
import { type PermissionFlagType } from 'twenty-shared/constants';

import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export type Tool = {
  description: string;
  inputSchema: FlexibleSchema<unknown>;
  execute(input: ToolInput, context: ToolExecutionContext): Promise<ToolOutput>;
  flag?: PermissionFlagType;
};
