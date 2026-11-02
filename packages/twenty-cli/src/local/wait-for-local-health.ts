import { setTimeout as delay } from 'node:timers/promises';

import { checkLocalHealth } from '@/local/check-local-health';
import { CliError } from '@/output/cli-error';

export const waitForLocalHealth = async ({
  port,
  signal,
}: {
  port: number;
  signal: AbortSignal;
}) => {
  const deadline = Date.now() + 300_000;

  while (Date.now() < deadline) {
    if (await checkLocalHealth({ port, signal })) {
      return;
    }
    await delay(1000, undefined, { signal });
  }

  throw new CliError({
    code: 'TIMEOUT',
    message:
      'The local environment did not become healthy within five minutes.',
    hint: 'The container was left in place. Run twenty local logs (add --test for the test instance).',
  });
};
