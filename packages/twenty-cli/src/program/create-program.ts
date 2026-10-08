import { Command, Option, type OutputConfiguration } from 'commander';

import { COMMAND_CATALOG } from '@/catalog/command-catalog';
import { COMMAND_TOPICS } from '@/catalog/command-topics';
import { HELP_GROUP } from '@/catalog/constants/help-group.constant';
import { CLI_VERSION } from '@/constants/cli-version.constant';
import { OUTPUT_MODES } from '@/output/constants/output-modes.constant';
import { type OutputMode } from '@/output/types/output-mode.type';
import { GLOBAL_FLAGS } from '@/program/constants/global-flags.constant';
import { ROOT_COMMAND_NAME } from '@/program/constants/root-command-name.constant';
import { registerCommand } from '@/program/register-command';
import { registerTopic } from '@/program/register-topic';
import { throwParseErrorOnExit } from '@/program/throw-parse-error-on-exit';

export const createProgram = ({
  outputMode,
  outputConfiguration,
}: {
  outputMode: OutputMode;
  outputConfiguration: OutputConfiguration;
}) => {
  const program = new Command(ROOT_COMMAND_NAME)
    .description('The Twenty command line')
    .version(CLI_VERSION, GLOBAL_FLAGS.VERSION, 'Print the version')
    .addOption(
      new Option(
        GLOBAL_FLAGS.JSON,
        'Print one JSON document on stdout',
      ).conflicts('format'),
    )
    .addOption(
      new Option(GLOBAL_FLAGS.FORMAT, 'Output format').choices(OUTPUT_MODES),
    )
    .option(GLOBAL_FLAGS.REMOTE, 'Saved remote to use for this command')
    .option(GLOBAL_FLAGS.NO_INPUT, 'Never prompt or open a browser')
    .helpOption(GLOBAL_FLAGS.HELP, 'Show help')
    .commandsGroup(HELP_GROUP.TOOLS)
    .helpCommand('help [command]', 'Show help for a command')
    .configureHelp({ showGlobalOptions: true })
    .configureOutput(outputConfiguration);

  throwParseErrorOnExit(program, ROOT_COMMAND_NAME);

  for (const topic of COMMAND_TOPICS) {
    registerTopic({ program, topic });
  }

  for (const definition of COMMAND_CATALOG) {
    registerCommand({ program, definition, outputMode });
  }

  return program;
};
