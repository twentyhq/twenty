import { Option, type Command } from 'commander';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { getCommandName } from '@/catalog/get-command-name';
import { type CommandDefinition } from '@/catalog/types/command-definition.type';
import { type CommandOptionDefinition } from '@/catalog/types/command-option-definition.type';
import { type OutputMode } from '@/output/types/output-mode.type';
import { getCommandByPath } from '@/program/find-command-by-path';
import { runCommand } from '@/program/run-command';
import { throwParseErrorOnExit } from '@/program/throw-parse-error-on-exit';

const createOption = ({
  flags,
  description,
  choices,
  required,
  hidden,
}: CommandOptionDefinition) => {
  const option = new Option(flags, description);

  if (hidden === true) {
    option.hideHelp();
  }

  if (isDefined(choices)) {
    option.choices(choices);
  }

  if (required === true) {
    option.makeOptionMandatory();
  }

  return option;
};

const formatExamples = (examples: string[]) =>
  `\nExamples:\n${examples.map((example) => `  ${example}`).join('\n')}\n`;

export const registerCommand = ({
  program,
  definition,
  outputMode,
}: {
  program: Command;
  definition: CommandDefinition;
  outputMode: OutputMode;
}) => {
  const parent = getCommandByPath(program, definition.path.slice(0, -1));
  const command = parent
    .command(definition.path[definition.path.length - 1])
    .description(definition.description);

  if (isDefined(definition.helpGroup)) {
    command.helpGroup(definition.helpGroup);
  }

  for (const argument of definition.arguments ?? []) {
    command.argument(
      argument.required ? `<${argument.name}>` : `[${argument.name}]`,
      argument.description,
    );
  }

  for (const optionDefinition of definition.options ?? []) {
    command.addOption(createOption(optionDefinition));
  }

  if (isNonEmptyArray(definition.examples)) {
    command.addHelpText('after', formatExamples(definition.examples));
  }

  throwParseErrorOnExit(command, getCommandName(definition));

  command.action(() =>
    runCommand({
      definition,
      outputMode,
      commandArguments: command.processedArgs,
      options: command.optsWithGlobals(),
    }),
  );
};
