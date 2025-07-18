import { ToolContext } from 'src/engine/core-modules/tool/types/tool-context.type';

export type ToolInput = {
  parameters: Record<string, unknown>;
  context: ToolContext;
};
