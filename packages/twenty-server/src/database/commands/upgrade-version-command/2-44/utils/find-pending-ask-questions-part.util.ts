import { isNonEmptyString } from '@sniptt/guards';
import { type AskQuestionItem } from 'twenty-shared/ai';
import { isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';

type StoredToolPart = {
  toolName: string | null;
  toolCallId: string | null;
  toolOutput: unknown;
};

// The shape ask_questions stored while waiting, as of 2.44.
export const findPendingAskQuestionsPart = (
  parts: StoredToolPart[],
): { toolCallId: string; questions: AskQuestionItem[] } | undefined => {
  for (const part of parts) {
    const result = isPlainObject(part.toolOutput)
      ? part.toolOutput.result
      : undefined;

    if (
      part.toolName === 'ask_questions' &&
      isNonEmptyString(part.toolCallId) &&
      isPlainObject(result) &&
      result.status === 'pending' &&
      isNonEmptyArray(result.questions)
    ) {
      return {
        toolCallId: part.toolCallId,
        questions: result.questions as AskQuestionItem[],
      };
    }
  }

  return undefined;
};
