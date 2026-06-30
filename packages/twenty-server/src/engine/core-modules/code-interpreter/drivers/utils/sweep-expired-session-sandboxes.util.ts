import { type Sandbox } from '@e2b/code-interpreter';

import { isDefined } from 'twenty-shared/utils';

import { SESSION_SANDBOX_METADATA_KEY } from 'src/engine/core-modules/code-interpreter/constants/session-sandbox-metadata-key.constant';

type SandboxApi = typeof Sandbox;

// E2B retains paused sandboxes indefinitely, so abandoned sessions need an age bound.
export const sweepExpiredSessionSandboxes = async (
  sandboxApi: SandboxApi,
  apiKey: string,
  maxAgeMs: number,
): Promise<number> => {
  const paginator = sandboxApi.list({
    apiKey,
    query: { state: ['running', 'paused'] },
  });

  const sandboxes: Awaited<ReturnType<typeof paginator.nextItems>> = [];

  while (paginator.hasNext) {
    sandboxes.push(...(await paginator.nextItems()));
  }

  const expiredBefore = Date.now() - maxAgeMs;

  const expiredSandboxes = sandboxes.filter(
    (sandbox) =>
      isDefined(sandbox.metadata?.[SESSION_SANDBOX_METADATA_KEY]) &&
      // startedAt is typed as Date but comes back as an ISO string at runtime.
      new Date(sandbox.startedAt).getTime() < expiredBefore,
  );

  await Promise.all(
    expiredSandboxes.map((sandbox) =>
      sandboxApi.kill(sandbox.sandboxId, { apiKey }).catch(() => undefined),
    ),
  );

  return expiredSandboxes.length;
};
