import { type Sandbox } from '@e2b/code-interpreter';

import { SESSION_SANDBOX_METADATA_KEY } from 'src/engine/core-modules/code-interpreter/constants/session-sandbox-metadata-key.constant';

type SandboxApi = typeof Sandbox;

// Kills every sandbox tagged for a session — used when a conversation is deleted.
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
      .map((sandbox) =>
        sandboxApi.kill(sandbox.sandboxId, { apiKey }).catch(() => undefined),
      ),
  );
};
