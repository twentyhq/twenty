import { type Sandbox } from '@e2b/code-interpreter';

import { SESSION_SANDBOX_METADATA_KEY } from 'src/engine/core-modules/code-interpreter/constants/session-sandbox-metadata-key.constant';
import { sweepExpiredSessionSandboxes } from 'src/engine/core-modules/code-interpreter/drivers/utils/sweep-expired-session-sandboxes.util';

const apiKey = 'test-api-key';
const sessionId = 'workspace-1:thread-1';
const dayMs = 24 * 60 * 60 * 1000;

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
  { tag = sessionId, ageMs = 0 }: { tag?: string | null; ageMs?: number } = {},
): ListedSandbox => ({
  sandboxId,
  metadata: tag === null ? {} : { [SESSION_SANDBOX_METADATA_KEY]: tag },
  startedAt: new Date(Date.now() - ageMs).toISOString(),
});

describe('sweepExpiredSessionSandboxes', () => {
  it('kills only session sandboxes older than the max age', async () => {
    const { api, kill } = buildApi([
      sandboxInfo('sbx-old', { ageMs: 2 * dayMs }),
      sandboxInfo('sbx-fresh', { ageMs: 60 * 1000 }),
      sandboxInfo('sbx-untagged', { tag: null, ageMs: 5 * dayMs }),
    ]);

    const killed = await sweepExpiredSessionSandboxes(api, apiKey, dayMs);

    expect(killed).toBe(1);
    expect(kill).toHaveBeenCalledWith('sbx-old', { apiKey });
    expect(kill).not.toHaveBeenCalledWith('sbx-fresh', { apiKey });
    expect(kill).not.toHaveBeenCalledWith('sbx-untagged', { apiKey });
  });

  it('lists both running and paused sandboxes', async () => {
    const { api, list } = buildApi([]);

    await sweepExpiredSessionSandboxes(api, apiKey, 1000);

    expect(list).toHaveBeenCalledWith({
      apiKey,
      query: { state: ['running', 'paused'] },
    });
  });
});
