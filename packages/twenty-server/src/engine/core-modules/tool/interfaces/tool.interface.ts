import { JSONSchema7 } from 'json-schema';

export type ToolInput = {
  parameters: Record<string, unknown>;
  context: ToolContext;
};

export type ToolContext = {
  workspaceId: string;
  userId?: string;
  roleId?: string;
  [key: string]: unknown;
};

export type ToolOutput = {
  result?: unknown;
  error?: string;
};

export type Tool = {
  description: string;
  parameters: JSONSchema7;
  execute(input: ToolInput): Promise<ToolOutput>;
};
