import { isDefined } from 'twenty-shared/utils';

import { createLocalContainer } from '@/local/create-local-container';
import { readLocalContainer } from '@/local/read-local-container';
import { runDocker } from '@/local/run-docker';
import {
  type LocalContainer,
  type LocalEnvironment,
} from '@/local/types/local-environment.type';
import { CliError } from '@/output/cli-error';

export const replaceLocalContainer = async ({
  environment,
  existing,
  image,
  environmentVariables,
  signal,
}: {
  environment: LocalEnvironment;
  existing: LocalContainer;
  image: string;
  environmentVariables: string[];
  signal: AbortSignal;
}) => {
  const previousName = `${environment.name}-previous`;
  try {
    await runDocker({ args: ['rename', existing.id, previousName], signal });
    if (existing.running) {
      await runDocker({ args: ['stop', '--time', '30', existing.id], signal });
    }
    await createLocalContainer({
      environment,
      image,
      port: existing.port,
      containerPort: existing.containerPort,
      environmentVariables,
      shouldStart: false,
      signal,
    });
  } catch (error) {
    const recoverySignal = AbortSignal.timeout(60_000);
    try {
      const current = await readLocalContainer(environment, recoverySignal);
      if (isDefined(current) && current.id !== existing.id) {
        await runDocker({ args: ['rm', current.id], signal: recoverySignal });
      }
      if (current?.id !== existing.id) {
        await runDocker({
          args: ['rename', existing.id, environment.name],
          signal: recoverySignal,
        });
      }
      if (existing.running) {
        await runDocker({
          args: ['start', existing.id],
          signal: recoverySignal,
        });
      }
    } catch (recoveryError) {
      throw new CliError({
        code: 'LOCAL_ENVIRONMENT_FAILED',
        message:
          'Upgrade failed and the previous container could not be restored automatically.',
        hint: `The previous settings remain in container ${existing.id}. Inspect it with docker inspect before retrying.`,
        cause: recoveryError,
        details: {
          originalError: error instanceof Error ? error.message : String(error),
        },
      });
    }
    throw error;
  }

  await runDocker({
    args: ['rm', existing.id],
    signal: AbortSignal.timeout(60_000),
  });
  await runDocker({ args: ['start', environment.name], signal });
};
