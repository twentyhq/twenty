import { type CommandRun } from '@/catalog/types/command-run.type';
import { type CommandContext } from '@/catalog/types/command-context.type';
import { checkLocalRuntime } from '@/local/check-local-runtime';
import { readLocalOptions } from '@/local/read-local-options';
import { readLocalContainer } from '@/local/read-local-container';
import { runDocker } from '@/local/run-docker';

export const runLocalStopCommand: CommandRun<CommandContext> = async ({
  options,
  signal,
}) => {
  const { environment } = readLocalOptions(options);
  await checkLocalRuntime(signal);
  const container = await readLocalContainer(environment, signal);
  if (container?.running) {
    await runDocker({ args: ['stop', container.id], signal });
  }

  return {
    data: {
      name: environment.name,
      stopped: Boolean(container),
      dataPreserved: true,
    },
    human: container
      ? 'Local environment stopped. Data is preserved.'
      : 'No local environment has been created.',
  };
};
