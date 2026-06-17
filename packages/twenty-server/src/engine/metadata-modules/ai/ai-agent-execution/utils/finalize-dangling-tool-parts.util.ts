import { isToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

const INTERRUPTED_TOOL_ERROR_TEXT = 'Tool execution was interrupted.';

// A tool part must always carry a defined `input`. convertToModelMessages
// serializes every non-streaming tool part into a provider `tool_use` block,
// and a nullish input produces a block with no `input` field — which the
// Anthropic API rejects, permanently bricking every later turn of the thread
// (see issue #21695). Normalizing here, right before parts are persisted,
// guarantees the stored history can always be replayed into a valid request.
export const finalizeDanglingToolParts = (
  parts: ExtendedUIMessagePart[],
): ExtendedUIMessagePart[] =>
  parts
    .filter((part) => !(isToolUIPart(part) && part.state === 'input-streaming'))
    .map((part) => {
      if (!isToolUIPart(part)) {
        return part;
      }

      // A tool call whose input was received but never resolved (the run was
      // interrupted mid-flight) is rewritten to an errored result.
      if (part.state === 'input-available') {
        return {
          ...part,
          state: 'output-error',
          input: part.input ?? {},
          errorText: INTERRUPTED_TOOL_ERROR_TEXT,
        } as ExtendedUIMessagePart;
      }

      // A tool call that errored before its input was captured (e.g. it failed
      // input validation) is persisted with a null input. Backfill an empty
      // object so it still serializes to a well-formed tool_use block.
      if (part.state === 'output-error' && part.input == null) {
        return {
          ...part,
          input: {},
        } as ExtendedUIMessagePart;
      }

      return part;
    });
