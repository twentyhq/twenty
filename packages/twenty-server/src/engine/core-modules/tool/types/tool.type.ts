import { type JSONSchema7 } from 'json-schema';
import { type ZodType } from 'zod';

import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';

export type Tool = {
  description: string;
  inputSchema: JSONSchema7 | ZodType;
  execute(input: ToolInput): Promise<ToolOutput>;
  flag?: PermissionFlagType;
};
