import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

// human input or a conversation make an Agent step, which must keep its agent
export const isConversationalWorkflowStepInput = (
  input: Record<string, unknown> | undefined,
): boolean => {
  const humanInputInstructions = input?.humanInputInstructions;

  return (
    (isString(humanInputInstructions) &&
      isNonEmptyString(humanInputInstructions.trim())) ||
    isDefined(input?.conversation)
  );
};
