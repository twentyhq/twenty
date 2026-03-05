import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const isUIToolCallMessage = (message: ExtendedUIMessage) => {
  return message.parts.some(
    (part) =>
      part.type === 'tool-execute_tool' &&
      (part.input as any)?.toolName === 'navigate_app',
  );
};
