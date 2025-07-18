import { JSONSchema7 } from 'json-schema';

import { ToolInput } from './tool-input.type';
import { ToolOutput } from './tool-output.type';

export type Tool = {
  description: string;
  parameters: JSONSchema7;
  execute(input: ToolInput): Promise<ToolOutput>;
};
