import { once } from 'node:events';

import { isNonEmptyString } from '@sniptt/guards';

import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { formatProgressLine } from '@/output/format-progress-line';
import { formatWarningLine } from '@/output/style';
import { type Output } from '@/output/types/output.type';

type DevOutputMessage = { message: string; code?: string; percentage?: number };

const formatDevOutputMessage = ({
  message,
  code,
  percentage,
}: DevOutputMessage) => {
  if (isNonEmptyString(code)) {
    return formatWarningLine(message);
  }

  return formatProgressLine({ message, percentage });
};

export const createDevOutput = (context: TargetCommandContext) => {
  const messages: DevOutputMessage[] = [];
  let delivery = Promise.resolve();
  let omittedMessages = 0;
  const output: Output = {
    ...context.output,
    progress: (progress) => {
      if (messages.length < 32) messages.push(progress);
      else omittedMessages += 1;
    },
    warn: (warning) => {
      if (messages.length < 32) messages.push(warning);
      else omittedMessages += 1;
    },
  };
  const emit = (
    event: { kind: string; message: string; [key: string]: unknown },
    signal: AbortSignal,
  ) => {
    const pendingMessages = messages.splice(0);
    if (omittedMessages > 0) {
      pendingMessages.push({
        message: `${omittedMessages} additional progress messages omitted.`,
      });
      omittedMessages = 0;
    }
    const next = delivery.then(async () => {
      signal.throwIfAborted();

      if (context.outputMode === 'ndjson') {
        await context.output.event(
          'progress',
          { ...event, messages: pendingMessages },
          signal,
        );
      } else {
        const text = [
          ...pendingMessages.map(formatDevOutputMessage),
          event.message,
        ]
          .filter((message) => message.length > 0)
          .join('\n');

        if (!process.stderr.write(`${text}\n`)) {
          await once(process.stderr, 'drain', { signal });
        }
      }
    });

    delivery = next.catch(() => undefined);

    return next;
  };

  return { output, emit };
};
