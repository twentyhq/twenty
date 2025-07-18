import { JSONSchema7 } from 'json-schema';
import { ZodType } from 'zod';

import { ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export type Tool = {
  description: string;
  parameters: JSONSchema7 | ZodType;
  execute(input: ToolInput): Promise<ToolOutput>;
};
