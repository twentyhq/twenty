import { type ExtendedUIMessage } from 'twenty-shared/ai';

type ToolCallInput = { toolName?: string };

const isToolCallInput = (value: unknown): value is ToolCallInput =>
  typeof value === 'object' && value !== null && 'toolName' in value;

export const isUIToolCallMessage = (message: ExtendedUIMessage) => {
  return message.parts.some(
    (part) =>
      part.type === 'tool-execute_tool' &&
      isToolCallInput(part.input) &&
      part.input.toolName === 'navigate_app',
  );
};
