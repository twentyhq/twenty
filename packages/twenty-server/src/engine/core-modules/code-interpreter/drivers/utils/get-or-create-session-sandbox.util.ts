import { type Sandbox } from '@e2b/code-interpreter';

import { isDefined } from 'twenty-shared/utils';

export const SESSION_SANDBOX_METADATA_KEY = 'twentySessionId';

type SandboxApi = typeof Sandbox;

type GetOrCreateSessionSandboxArgs = {
  sandboxApi: SandboxApi;
  apiKey: string;
  sessionId: string;
  idleTimeoutMs: number;
};

const listSandboxesForSession = async (
  sandboxApi: SandboxApi,
  apiKey: string,
  sessionId: string,
) => {
  const sandboxes = await sandboxApi.list({
    apiKey,
    query: { metadata: { [SESSION_SANDBOX_METADATA_KEY]: sessionId } },
  });

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
  idleTimeoutMs: number,
): Promise<Sandbox | undefined> => {
  const sandbox = await sandboxApi
    .connect(sandboxId, { apiKey })
    .catch(() => undefined);

  if (!isDefined(sandbox)) {
    return undefined;
  }

  try {
    await sandbox.setTimeout(idleTimeoutMs);

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
) =>
  sandboxApi
    .connect(sandboxId, { apiKey })
    .then((sandbox) => sandbox.kill())
    .catch(() => undefined);

const createSessionSandbox = (
  sandboxApi: SandboxApi,
  apiKey: string,
  sessionId: string,
  idleTimeoutMs: number,
) =>
  sandboxApi.create({
    apiKey,
    timeoutMs: idleTimeoutMs,
    metadata: { [SESSION_SANDBOX_METADATA_KEY]: sessionId },
  });

export const getOrCreateSessionSandbox = async ({
  sandboxApi,
  apiKey,
  sessionId,
  idleTimeoutMs,
}: GetOrCreateSessionSandboxArgs): Promise<{
  sandbox: Sandbox;
  isReused: boolean;
}> => {
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
      idleTimeoutMs,
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
    idleTimeoutMs,
  );

  return { sandbox, isReused: false };
};
