import { type StepResult, type ToolSet } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

// An agent run outside chat keeps no stream to persist, only the SDK's step
// results. Rebuilding the parts a chat stream would have produced lets that
// run be stored and read back as an ordinary conversation.
export const mapAiStepsToUiMessageParts = (
  steps: StepResult<ToolSet>[],
): ExtendedUIMessagePart[] => {
  const parts: ExtendedUIMessagePart[] = [];
  const toolPartIndexByCallId = new Map<string, number>();

  for (const step of steps) {
    parts.push({ type: 'step-start' });

    for (const part of step.content) {
      switch (part.type) {
        case 'text':
          if (part.text.length > 0) {
            parts.push({ type: 'text', text: part.text });
          }
          break;
        case 'reasoning':
          if (part.text.length > 0) {
            parts.push({
              type: 'reasoning',
              text: part.text,
              providerMetadata: part.providerMetadata,
            });
          }
          break;
        case 'tool-call':
          toolPartIndexByCallId.set(part.toolCallId, parts.length);
          parts.push({
            type: `tool-${part.toolName}`,
            toolCallId: part.toolCallId,
            state: 'input-available',
            input: part.input,
            providerExecuted: part.providerExecuted,
          } as ExtendedUIMessagePart);
          break;
        case 'tool-result': {
          const index = toolPartIndexByCallId.get(part.toolCallId);

          if (index !== undefined) {
            parts[index] = {
              ...parts[index],
              state: 'output-available',
              output: part.output,
            } as ExtendedUIMessagePart;
          }
          break;
        }
        case 'tool-error': {
          const index = toolPartIndexByCallId.get(part.toolCallId);

          if (index !== undefined) {
            parts[index] = {
              ...parts[index],
              state: 'output-error',
              errorText: String(part.error),
            } as ExtendedUIMessagePart;
          }
          break;
        }
        default:
          break;
      }
    }
  }

  return parts;
};
