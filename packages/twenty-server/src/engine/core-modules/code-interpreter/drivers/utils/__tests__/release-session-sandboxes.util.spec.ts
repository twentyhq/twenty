import { type Sandbox } from '@e2b/code-interpreter';

import { SESSION_SANDBOX_METADATA_KEY } from 'src/engine/core-modules/code-interpreter/constants/session-sandbox-metadata-key.constant';
import { releaseSessionSandboxes } from 'src/engine/core-modules/code-interpreter/drivers/utils/release-session-sandboxes.util';

const apiKey = 'test-api-key';
const sessionId = 'workspace-1:thread-1';

type ListedSandbox = {
  sandboxId: string;
  metadata: Record<string, string>;
  startedAt: string;
};

const paginatorOf = (items: ListedSandbox[]) => {
  let fetched = false;

  return {
    get hasNext() {
      return !fetched;
    },
    nextItems: async () => {
      fetched = true;

      return items;
    },
  };
};

const buildApi = (items: ListedSandbox[]) => {
  const kill = jest.fn().mockResolvedValue(true);
  const list = jest.fn(() => paginatorOf(items));

  return { api: { list, kill } as unknown as typeof Sandbox, kill, list };
};

const sandboxInfo = (
  sandboxId: string,
  { tag = sessionId }: { tag?: string | null } = {},
): ListedSandbox => ({
  sandboxId,
  metadata: tag === null ? {} : { [SESSION_SANDBOX_METADATA_KEY]: tag },
  startedAt: new Date().toISOString(),
});

describe('releaseSessionSandboxes', () => {
  it('kills every sandbox tagged for the session', async () => {
    const { api, kill, list } = buildApi([
      sandboxInfo('sbx-1'),
      sandboxInfo('sbx-2'),
    ]);

    await releaseSessionSandboxes(api, apiKey, sessionId);

    expect(list).toHaveBeenCalledWith({
      apiKey,
      query: {
        state: ['running', 'paused'],
        metadata: { [SESSION_SANDBOX_METADATA_KEY]: sessionId },
      },
    });
    expect(kill).toHaveBeenCalledWith('sbx-1', { apiKey });
    expect(kill).toHaveBeenCalledWith('sbx-2', { apiKey });
  });

  it('ignores a sandbox whose tag does not match the session', async () => {
    const { api, kill } = buildApi([
      sandboxInfo('sbx-other', { tag: 'workspace-2:thread-9' }),
    ]);

    await releaseSessionSandboxes(api, apiKey, sessionId);

    expect(kill).not.toHaveBeenCalled();
  });
});
