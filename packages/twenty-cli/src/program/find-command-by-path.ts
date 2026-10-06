import { type Command } from 'commander';
import { isDefined } from 'twenty-shared/utils';

export const findCommandByPath = (program: Command, path: string[]) =>
  path.reduce<Command | undefined>(
    (parent, commandName) =>
      parent?.commands.find((command) => command.name() === commandName),
    program,
  );

export const getCommandByPath = (program: Command, path: string[]) => {
  const command = findCommandByPath(program, path);

  if (!isDefined(command)) {
    throw new Error(`Topic "${path.join(' ')}" is not registered.`);
  }

  return command;
};
