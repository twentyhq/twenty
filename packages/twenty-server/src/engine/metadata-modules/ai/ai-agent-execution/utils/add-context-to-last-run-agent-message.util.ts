import { isNonEmptyString } from '@sniptt/guards';
import { type RunAgentMessage } from 'twenty-shared/application';

export const addContextToLastRunAgentMessage = ({
  messages,
  context,
}: {
  messages: RunAgentMessage[];
  context: string;
}): RunAgentMessage[] =>
  messages.map((message, index) =>
    index === messages.length - 1
      ? {
          ...message,
          content: isNonEmptyString(message.content)
            ? `${context}\n\n${message.content}`
            : context,
        }
      : message,
  );
