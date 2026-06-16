import { type Sandbox } from '@e2b/code-interpreter';

import { isDefined } from 'twenty-shared/utils';

import { SESSION_SANDBOX_METADATA_KEY } from 'src/engine/core-modules/code-interpreter/drivers/utils/get-or-create-session-sandbox.util';

type SandboxApi = typeof Sandbox;

const killSandboxById = (
  sandboxApi: SandboxApi,
  apiKey: string,
  sandboxId: string,
) => sandboxApi.kill(sandboxId, { apiKey }).catch(() => undefined);

// Kills every sandbox tagged for a session — used when a conversation is
// deleted so its warm sandbox isn't left paused (and billed for storage) until
// the age sweep would reclaim it.
export const releaseSessionSandboxes = async (
  sandboxApi: SandboxApi,
  apiKey: string,
  sessionId: string,
): Promise<void> => {
  const paginator = sandboxApi.list({
    apiKey,
    query: {
      state: ['running', 'paused'],
      metadata: { [SESSION_SANDBOX_METADATA_KEY]: sessionId },
    },
  });

  const sandboxes: Awaited<ReturnType<typeof paginator.nextItems>> = [];

  while (paginator.hasNext) {
    sandboxes.push(...(await paginator.nextItems()));
  }

  await Promise.all(
    sandboxes
      .filter(
        (sandbox) =>
          sandbox.metadata?.[SESSION_SANDBOX_METADATA_KEY] === sessionId,
      )
      .map((sandbox) => killSandboxById(sandboxApi, apiKey, sandbox.sandboxId)),
  );
};

// Kills session sandboxes whose last start is older than maxAgeMs. Paused
// sandboxes are retained indefinitely by E2B, so abandoned conversations (never
// explicitly deleted) would otherwise accumulate forever; this is the bound.
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
      killSandboxById(sandboxApi, apiKey, sandbox.sandboxId),
    ),
  );

  return expiredSandboxes.length;
};
