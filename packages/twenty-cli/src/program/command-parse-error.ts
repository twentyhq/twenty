import { type CommanderError } from 'commander';

export class CommandParseError extends Error {
  readonly commanderError: CommanderError;
  readonly commandName: string;
  readonly operands: string[];

  constructor({
    commanderError,
    commandName,
    operands,
  }: {
    commanderError: CommanderError;
    commandName: string;
    operands: string[];
  }) {
    super(commanderError.message);
    this.name = 'CommandParseError';
    this.commanderError = commanderError;
    this.commandName = commandName;
    this.operands = operands;
  }
}
