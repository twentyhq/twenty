import { isDefined } from 'twenty-shared/utils';
import { once } from 'node:events';

import { readStringOption } from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { type CommandContext } from '@/catalog/types/command-context.type';
import { checkLocalRuntime } from '@/local/check-local-runtime';
import { readLocalInteger } from '@/local/read-local-integer';
import { readLocalOptions } from '@/local/read-local-options';
import { readLocalContainer } from '@/local/read-local-container';
import { runDocker } from '@/local/run-docker';
import { CliError } from '@/output/cli-error';

export const runLocalLogsCommand: CommandRun<CommandContext> = async ({
  options,
  signal,
  output,
  outputMode,
}) => {
  const { environment } = readLocalOptions(options);
  const lines =
    readLocalInteger({
      value: readStringOption(options, 'lines'),
      name: '--lines',
      maximum: 10000,
    }) ?? 50;
  const follow = options.follow !== false;
  await checkLocalRuntime(signal);
  const container = await readLocalContainer({ environment, signal });
  if (!isDefined(container)) {
    throw new CliError({
      code: 'NOT_FOUND',
      message: 'No local environment has been created.',
      hint: 'Run twenty local start first (add --test for the test instance).',
    });
  }
  await output.event('start', { name: environment.name, follow }, signal);
  await runDocker({
    args: [
      'logs',
      '--tail',
      String(lines),
      ...(follow ? ['--follow'] : []),
      container.id,
    ],
    signal,
    onOutput: async (message) => {
      if (outputMode === 'ndjson') {
        await output.event('record', { message }, signal);
      } else if (!process.stdout.write(message)) {
        await once(process.stdout, 'drain', { signal });
      }
    },
  });
  return {
    data: { name: environment.name, follow },
    human: 'Log stream completed.',
  };
};
