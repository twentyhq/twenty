import { type FlexibleSchema } from '@ai-sdk/provider-utils';

import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';

export type Tool = {
  description: string;
  inputSchema: FlexibleSchema<unknown>;
  execute(input: ToolInput, workspaceId: string): Promise<ToolOutput>;
  flag?: PermissionFlagType;
};
