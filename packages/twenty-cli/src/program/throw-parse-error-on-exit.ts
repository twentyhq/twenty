import { type Command } from 'commander';

import { CommandParseError } from '@/program/command-parse-error';

export const throwParseErrorOnExit = (command: Command, commandName: string) =>
  command.exitOverride((commanderError) => {
    throw new CommandParseError({
      commanderError,
      commandName,
      operands: command.args,
    });
  });
