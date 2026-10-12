import { type CommanderError } from 'commander';
import { isNonEmptyString } from '@sniptt/guards';
import { capitalize, isNonEmptyArray } from 'twenty-shared/utils';

import { VERSION_COMMAND_DEFINITION } from '@/commands/version/version.command-definition';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { createOutput } from '@/output/create-output';
import { type OutputMode } from '@/output/types/output-mode.type';
import { type CommandParseError } from '@/program/command-parse-error';
import { ROOT_COMMAND_NAME } from '@/program/constants/root-command-name.constant';
import { runCommand } from '@/program/run-command';

const HELP_COMMAND_NAME = 'help';

const formatCommanderMessage = (message: string) => {
  const flattenedMessage = message
    .replace(/^error: /, '')
    .replace(/\s*\n\s*/g, ' ')
    .trim();

  return capitalize(flattenedMessage);
};

const getFullCommandName = (commandName: string) =>
  commandName === ROOT_COMMAND_NAME
    ? ROOT_COMMAND_NAME
    : `${ROOT_COMMAND_NAME} ${commandName}`;

const createUsageError = ({
  message,
  commandName,
}: {
  message: string;
  commandName: string;
}) =>
  new CliError({
    code: 'USAGE',
    exitCode: EXIT_CODE.USAGE,
    message,
    hint: `See: ${getFullCommandName(commandName)} --help`,
  });

const isHelpDisplay = (commanderError: CommanderError, operands: string[]) =>
  commanderError.code === 'commander.helpDisplayed' ||
  (commanderError.code === 'commander.help' &&
    (commanderError.exitCode === 0 || !isNonEmptyArray(operands)));

const getUnknownHelpTarget = (operands: string[]) =>
  (operands[0] === HELP_COMMAND_NAME ? operands.slice(1) : operands).join(' ');

export const handleParseError = async ({
  error,
  outputMode,
  capturedOutput,
}: {
  error: CommandParseError;
  outputMode: OutputMode;
  capturedOutput: { standardOutput: string; standardError: string };
}) => {
  const { commanderError, commandName, operands } = error;

  if (commanderError.code === 'commander.version') {
    await runCommand({
      definition: VERSION_COMMAND_DEFINITION,
      outputMode,
      commandArguments: [],
      options: {},
    });

    return;
  }

  const output = createOutput({ mode: outputMode, command: commandName });

  if (isHelpDisplay(commanderError, operands)) {
    const help = isNonEmptyString(capturedOutput.standardOutput)
      ? capturedOutput.standardOutput
      : capturedOutput.standardError;

    output.succeed({ data: { help }, human: help });

    return;
  }

  if (commanderError.code === 'commander.help') {
    output.fail(
      createUsageError({
        message: `Unknown command '${getUnknownHelpTarget(operands)}'`,
        commandName,
      }),
    );

    return;
  }

  output.fail(
    createUsageError({
      message: formatCommanderMessage(commanderError.message),
      commandName,
    }),
  );
};
