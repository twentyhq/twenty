import { isDefined } from 'twenty-shared/utils';

import { getCommandName } from '@/catalog/get-command-name';
import { type CommandContext } from '@/catalog/types/command-context.type';
import { type CommandDefinition } from '@/catalog/types/command-definition.type';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { createOutput } from '@/output/create-output';
import { toCliError } from '@/output/to-cli-error';
import { type OutputMode } from '@/output/types/output-mode.type';
import { resolveCommandTarget } from '@/program/resolve-command-target';
import { toPublicTarget } from '@/target/to-public-target';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';

const assertOutputModeSupported = (
  definition: CommandDefinition,
  outputMode: OutputMode,
) => {
  if (!definition.outputModes.includes(outputMode)) {
    throw new CliError({
      code: 'USAGE',
      exitCode: EXIT_CODE.USAGE,
      message: `twenty ${getCommandName(definition)} does not support ${outputMode} output.`,
      hint: `Supported: ${definition.outputModes.join(', ')}`,
    });
  }
};

export const runCommand = async ({
  definition,
  outputMode,
  commandArguments,
  options,
}: {
  definition: CommandDefinition;
  outputMode: OutputMode;
  commandArguments: unknown[];
  options: Record<string, unknown>;
}) => {
  const command = getCommandName(definition);
  const output = createOutput({ mode: outputMode, command });
  const abortController = new AbortController();
  const abortOnInterrupt = () => abortController.abort();
  let target: ResolvedTarget | undefined;

  process.once('SIGINT', abortOnInterrupt);

  try {
    assertOutputModeSupported(definition, outputMode);

    const context: CommandContext = {
      command,
      arguments: commandArguments,
      options,
      output,
      outputMode,
      signal: abortController.signal,
    };

    if (!definition.needsTarget) {
      const run = await definition.load();

      output.succeed(await run(context));

      return;
    }

    const resolvedTarget = await resolveCommandTarget({
      options,
      outputMode,
      output,
      signal: abortController.signal,
    });

    target = resolvedTarget;

    const run = await definition.load();

    output.succeed(
      await run({ ...context, target: resolvedTarget }),
      toPublicTarget(resolvedTarget),
    );
  } catch (error) {
    output.fail(
      toCliError(error, abortController.signal),
      isDefined(target) ? toPublicTarget(target) : undefined,
    );
  } finally {
    process.off('SIGINT', abortOnInterrupt);
    abortController.abort();
  }
};
