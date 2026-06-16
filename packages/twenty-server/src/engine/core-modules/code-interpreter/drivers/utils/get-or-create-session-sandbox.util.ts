import { type Sandbox } from '@e2b/code-interpreter';

import { isDefined } from 'twenty-shared/utils';

export const SESSION_SANDBOX_METADATA_KEY = 'twentySessionId';

type SandboxApi = typeof Sandbox;

type GetOrCreateSessionSandboxArgs = {
  sandboxApi: SandboxApi;
  apiKey: string;
  sessionId: string;
  timeoutMs: number;
  idleTimeoutMs: number;
};

const listSandboxesForSession = async (
  sandboxApi: SandboxApi,
  apiKey: string,
  sessionId: string,
) => {
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

  // Re-check the tag client-side so a loose server-side match can never reuse
  // another tenant's sandbox.
  return sandboxes.filter(
    (sandbox) => sandbox.metadata?.[SESSION_SANDBOX_METADATA_KEY] === sessionId,
  );
};

const connectAndKeepAlive = async (
  sandboxApi: SandboxApi,
  apiKey: string,
  sandboxId: string,
  timeoutMs: number,
): Promise<Sandbox | undefined> => {
  const sandbox = await sandboxApi
    .connect(sandboxId, { apiKey })
    .catch(() => undefined);

  if (!isDefined(sandbox)) {
    return undefined;
  }

  try {
    await sandbox.setTimeout(timeoutMs);

    return sandbox;
  } catch {
    // Couldn't refresh the timeout — kill it instead of leaking a running sandbox.
    await sandbox.kill().catch(() => undefined);

    return undefined;
  }
};

const killSandboxById = (
  sandboxApi: SandboxApi,
  apiKey: string,
  sandboxId: string,
) => sandboxApi.kill(sandboxId, { apiKey }).catch(() => undefined);

const createSessionSandbox = (
  sandboxApi: SandboxApi,
  apiKey: string,
  sessionId: string,
  timeoutMs: number,
) =>
  sandboxApi.create({
    apiKey,
    timeoutMs,
    lifecycle: { onTimeout: 'pause', autoResume: true },
    metadata: { [SESSION_SANDBOX_METADATA_KEY]: sessionId },
  });

export const getOrCreateSessionSandbox = async ({
  sandboxApi,
  apiKey,
  sessionId,
  timeoutMs,
  idleTimeoutMs,
}: GetOrCreateSessionSandboxArgs): Promise<{
  sandbox: Sandbox;
  isReused: boolean;
}> => {
  // The sandbox must outlive a single execution and the idle window before it
  // auto-pauses, so take the larger of the two.
  const aliveTimeoutMs = Math.max(timeoutMs, idleTimeoutMs);

  const sessionSandboxes = await listSandboxesForSession(
    sandboxApi,
    apiKey,
    sessionId,
  );

  let reusedSandbox: Sandbox | undefined;
  let reusedSandboxId: string | undefined;

  for (const { sandboxId } of sessionSandboxes) {
    const sandbox = await connectAndKeepAlive(
      sandboxApi,
      apiKey,
      sandboxId,
      aliveTimeoutMs,
    );

    if (isDefined(sandbox)) {
      reusedSandbox = sandbox;
      reusedSandboxId = sandboxId;
      break;
    }
  }

  if (isDefined(reusedSandbox)) {
    await Promise.all(
      sessionSandboxes
        .filter(({ sandboxId }) => sandboxId !== reusedSandboxId)
        .map(({ sandboxId }) => killSandboxById(sandboxApi, apiKey, sandboxId)),
    );

    return { sandbox: reusedSandbox, isReused: true };
  }

  const sandbox = await createSessionSandbox(
    sandboxApi,
    apiKey,
    sessionId,
    aliveTimeoutMs,
  );

  return { sandbox, isReused: false };
};
