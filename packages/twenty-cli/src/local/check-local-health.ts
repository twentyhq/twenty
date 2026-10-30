import { setTimeout as delay } from 'node:timers/promises';

import { CliError } from '@/output/cli-error';

export const checkLocalHealth = async (port: number, signal: AbortSignal) => {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/healthz`, {
      signal: AbortSignal.any([signal, AbortSignal.timeout(3000)]),
      redirect: 'error',
    });
    await response.body?.cancel();
    return response.ok;
  } catch {
    signal.throwIfAborted();
    return false;
  }
};

export const waitForLocalHealth = async (port: number, signal: AbortSignal) => {
  const deadline = Date.now() + 300_000;

  while (Date.now() < deadline) {
    if (await checkLocalHealth(port, signal)) {
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
