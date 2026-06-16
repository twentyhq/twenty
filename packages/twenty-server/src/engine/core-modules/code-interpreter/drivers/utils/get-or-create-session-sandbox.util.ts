import { type Sandbox } from '@e2b/code-interpreter';

import { isDefined } from 'twenty-shared/utils';

// Sandboxes are tagged with this metadata so a conversation's sandbox can be
// found by its session id alone — E2B is the registry, no external store.
export const SESSION_SANDBOX_METADATA_KEY = 'twentySessionId';

type GetOrCreateSessionSandboxArgs = {
  sandboxApi: typeof Sandbox;
  apiKey: string;
  sessionId: string;
  idleTimeoutMs: number;
};

export const getOrCreateSessionSandbox = async ({
  sandboxApi,
  apiKey,
  sessionId,
  idleTimeoutMs,
}: GetOrCreateSessionSandboxArgs): Promise<{
  sandbox: Sandbox;
  isReused: boolean;
}> => {
  const runningSandboxes = await sandboxApi.list({
    apiKey,
    query: { metadata: { [SESSION_SANDBOX_METADATA_KEY]: sessionId } },
  });

  // Defense in depth: the list query is filtered server-side, but we re-check
  // the tag client-side and only ever reuse (or reap) an EXACT match. A warm
  // sandbox carries the previous turn's files, kernel state and injected token,
  // so a loose or prefixed metadata match must never hand one session's sandbox
  // to another tenant.
  const sessionSandboxes = runningSandboxes.filter(
    (sandbox) => sandbox.metadata?.[SESSION_SANDBOX_METADATA_KEY] === sessionId,
  );

  // Try the candidates in order and keep the first one we can actually connect
  // to — a listed sandbox may have been reclaimed between list and connect. We
  // only reap the rest after securing a live one, so a valid sandbox is never
  // killed before it has been tried.
  let reusedSandbox: Sandbox | undefined;
  let keptIndex = -1;

  for (let index = 0; index < sessionSandboxes.length; index++) {
    try {
      const sandbox = await sandboxApi.connect(
        sessionSandboxes[index].sandboxId,
        { apiKey },
      );

      await sandbox.setTimeout(idleTimeoutMs);

      reusedSandbox = sandbox;
      keptIndex = index;
      break;
    } catch {
      // Not connectable — try the next candidate.
    }
  }

  if (isDefined(reusedSandbox)) {
    // A race can leave more than one sandbox for a session; reap the ones we
    // didn't keep instead of letting them linger until their idle timeout.
    await Promise.all(
      sessionSandboxes
        .filter((_, index) => index !== keptIndex)
        .map((duplicate) =>
          sandboxApi
            .connect(duplicate.sandboxId, { apiKey })
            .then((sandbox) => sandbox.kill())
            .catch(() => undefined),
        ),
    );

    return { sandbox: reusedSandbox, isReused: true };
  }

  const sandbox = await sandboxApi.create({
    apiKey,
    timeoutMs: idleTimeoutMs,
    metadata: { [SESSION_SANDBOX_METADATA_KEY]: sessionId },
  });

  return { sandbox, isReused: false };
};
