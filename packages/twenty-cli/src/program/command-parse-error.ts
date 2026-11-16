import { type CommanderError } from 'commander';

export class CommandParseError extends Error {
  readonly commanderError: CommanderError;
  readonly commandName: string;
  readonly operands: string[];
  readonly options: Record<string, unknown>;

  constructor({
    commanderError,
    commandName,
    operands,
    options,
  }: {
    commanderError: CommanderError;
    commandName: string;
    operands: string[];
    options: Record<string, unknown>;
  }) {
    super(commanderError.message);
    this.name = 'CommandParseError';
    this.commanderError = commanderError;
    this.commandName = commandName;
    this.operands = operands;
    this.options = options;
  }
}
