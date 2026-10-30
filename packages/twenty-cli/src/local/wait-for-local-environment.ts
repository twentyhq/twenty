import { waitForLocalHealth } from '@/local/check-local-health';
import { getLocalStatus } from '@/local/get-local-status';
import { readLocalContainer } from '@/local/read-local-container';
import { type LocalEnvironment } from '@/local/types/local-environment.type';
import { CliError } from '@/output/cli-error';

export const waitForLocalEnvironment = async ({
  environment,
  port,
  signal,
}: {
  environment: Pick<LocalEnvironment, 'name' | 'port'>;
  port: number;
  signal: AbortSignal;
}) => {
  await waitForLocalHealth({ port, signal });
  const status = await getLocalStatus({
    environment,
    container: await readLocalContainer({ environment, signal }),
    signal,
  });
  if (status.status !== 'healthy') {
    throw new CliError({
      code: 'LOCAL_ENVIRONMENT_FAILED',
      message: 'The local environment stopped responding during startup.',
      hint: 'Check twenty local logs (add --test for the test instance). Data volumes are preserved.',
    });
  }
  return status;
};
