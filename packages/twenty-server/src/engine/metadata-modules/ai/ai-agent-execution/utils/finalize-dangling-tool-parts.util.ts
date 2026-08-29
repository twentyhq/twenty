import {
  isToolUIPart,
  type UIDataTypes,
  type UIMessagePart,
  type UITools,
} from 'ai';

const INTERRUPTED_TOOL_ERROR_TEXT = 'Tool execution was interrupted.';

// A tool part with a nullish input serializes to a `tool_use` block with no
// `input` field, which Anthropic rejects — bricking every later turn (#21695).
export const finalizeDanglingToolParts = <
  TPart extends UIMessagePart<UIDataTypes, UITools>,
>(
  parts: TPart[],
): TPart[] => {
  const seenToolCallIds = new Set<string>();

  return parts
    .filter((part) => !(isToolUIPart(part) && part.state === 'input-streaming'))
    .filter((part) => {
      if (!isToolUIPart(part)) {
        return true;
      }

      if (seenToolCallIds.has(part.toolCallId)) {
        return false;
      }

      seenToolCallIds.add(part.toolCallId);

      return true;
    })
    .map((part) => {
      if (!isToolUIPart(part)) {
        return part;
      }

      // Dangling call interrupted mid-flight: resolve it as an error.
      if (part.state === 'input-available') {
        return {
          ...part,
          state: 'output-error',
          input: part.input ?? {},
          errorText: INTERRUPTED_TOOL_ERROR_TEXT,
        } as TPart;
      }

      // Errored before its input was captured (e.g. failed input validation).
      if (part.state === 'output-error' && part.input == null) {
        return {
          ...part,
          input: {},
        } as TPart;
      }

      return part;
    });
};
