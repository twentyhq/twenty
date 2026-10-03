import { isNonEmptyString } from '@sniptt/guards';
import { type RunAgentMessage } from 'twenty-shared/application';

export const addAdditionalInstructionsToLastRunAgentMessage = ({
  messages,
  additionalInstructions,
}: {
  messages: RunAgentMessage[];
  additionalInstructions: string;
}): RunAgentMessage[] =>
  messages.map((message, index) =>
    index === messages.length - 1
      ? {
          ...message,
          content: isNonEmptyString(message.content)
            ? `${additionalInstructions}\n\n${message.content}`
            : additionalInstructions,
        }
      : message,
  );
