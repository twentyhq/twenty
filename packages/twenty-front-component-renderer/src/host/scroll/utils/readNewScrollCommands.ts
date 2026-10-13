import { isArray, isNumber } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { MAX_PENDING_SCROLL_COMMANDS } from '@/constants/MaxPendingScrollCommands';
import { type ReceivedScrollCommand } from '@/host/scroll/types/ReceivedScrollCommand';

export const readNewScrollCommands = ({
  scrollCommands,
  appliedSequence,
}: {
  scrollCommands: unknown;
  appliedSequence: number;
}): ReceivedScrollCommand[] => {
  if (!isArray(scrollCommands)) {
    return [];
  }

  const newScrollCommands: ReceivedScrollCommand[] = [];

  for (const scrollCommand of scrollCommands.slice(
    -MAX_PENDING_SCROLL_COMMANDS,
  )) {
    if (!isPlainObject(scrollCommand)) {
      continue;
    }

    const { sequence, acknowledgedNativeEditSequence, request } = scrollCommand;

    if (
      !isNumber(sequence) ||
      !Number.isSafeInteger(sequence) ||
      sequence <= appliedSequence
    ) {
      continue;
    }

    newScrollCommands.push({
      sequence,
      acknowledgedNativeEditSequence,
      request,
    });
  }

  return newScrollCommands.sort(
    (firstCommand, secondCommand) =>
      firstCommand.sequence - secondCommand.sequence,
  );
};
