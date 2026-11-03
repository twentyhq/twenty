import { type CommandRun } from '@/catalog/types/command-run.type';
import { type CommandContext } from '@/catalog/types/command-context.type';
import { checkLocalRuntime } from '@/local/check-local-runtime';
import { getLocalStatus } from '@/local/get-local-status';
import { readLocalOptions } from '@/local/read-local-options';
import { readLocalContainer } from '@/local/read-local-container';

export const runLocalStatusCommand: CommandRun<CommandContext> = async ({
  options,
  signal,
}) => {
  const { environment } = readLocalOptions(options);
  await checkLocalRuntime(signal);
  const container = await readLocalContainer({ environment, signal });
  const data = await getLocalStatus({ environment, container, signal });

  return {
    data,
    human: `Status: ${data.status}\nURL: ${data.url}${data.image ? `\nImage: ${data.image}` : ''}`,
  };
};
