import { isNumber } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { MAX_PENDING_SCROLL_COMMANDS } from '@/constants/MaxPendingScrollCommands';
import { type RemoteElementCommand } from '@/types/RemoteElementCommand';

export const readNewScrollCommands = ({
  scrollCommands,
  appliedSequence,
}: {
  scrollCommands: unknown[];
  appliedSequence: number;
}): RemoteElementCommand<unknown>[] => {
  const newScrollCommands: RemoteElementCommand<unknown>[] = [];

  for (const scrollCommand of scrollCommands.slice(
    -MAX_PENDING_SCROLL_COMMANDS,
  )) {
    if (!isPlainObject(scrollCommand)) {
      continue;
    }

    const { sequence, request } = scrollCommand;

    if (
      !isNumber(sequence) ||
      !Number.isSafeInteger(sequence) ||
      sequence <= appliedSequence
    ) {
      continue;
    }

    newScrollCommands.push({ sequence, request });
  }

  return newScrollCommands.sort(
    (firstCommand, secondCommand) =>
      firstCommand.sequence - secondCommand.sequence,
  );
};
