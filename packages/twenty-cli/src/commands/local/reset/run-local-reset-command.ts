import { readBooleanOption } from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { type CommandContext } from '@/catalog/types/command-context.type';
import { requireApproval } from '@/app/deployment/require-approval';
import { checkLocalRuntime } from '@/local/check-local-runtime';
import { readLocalOptions } from '@/local/read-local-options';
import {
  assertLocalStorage,
  readLocalContainer,
} from '@/local/read-local-container';
import { runDocker } from '@/local/run-docker';
import { isInteractionAllowed } from '@/program/is-interaction-allowed';

export const runLocalResetCommand: CommandRun<CommandContext> = async ({
  options,
  outputMode,
  signal,
}) => {
  const { environment } = readLocalOptions(options);
  await requireApproval({
    isApproved: readBooleanOption(options, 'yes'),
    canPrompt: isInteractionAllowed({ options, outputMode }),
    question: `Delete ${environment.name} and all its database, file and analytics data?`,
    code: 'CONFIRMATION_REQUIRED',
    message: `Reset permanently deletes all data in ${environment.name}.`,
    hint: 'Pass --yes to delete this local environment and its data.',
    declinedMessage: 'Local environment reset cancelled.',
    signal,
  });
  await checkLocalRuntime(signal);
  const container = await readLocalContainer({ environment, signal });
  if (container) {
    assertLocalStorage({ environment, container });
    await runDocker({ args: ['rm', '--force', container.id], signal });
  }
  const existingVolumes = (
    await runDocker({ args: ['volume', 'ls', '--format', '{{.Name}}'], signal })
  )
    .trim()
    .split('\n');
  const volumes = Object.values(environment.volumes).filter((name) =>
    existingVolumes.includes(name),
  );
  if (volumes.length > 0) {
    await runDocker({ args: ['volume', 'rm', ...volumes], signal });
  }
  return {
    data: { name: environment.name, reset: true, removedVolumes: volumes },
    human: `Local environment data deleted. Run twenty local start${options.test ? ' --test' : ''} to create a fresh instance.`,
  };
};
