import { type Sandbox } from '@e2b/code-interpreter';

import { SESSION_SANDBOX_METADATA_KEY } from 'src/engine/core-modules/code-interpreter/constants/session-sandbox-metadata-key.constant';
import { getOrCreateSessionSandbox } from 'src/engine/core-modules/code-interpreter/drivers/utils/get-or-create-session-sandbox.util';

type SandboxApiMock = {
  list: jest.Mock;
  connect: jest.Mock;
  create: jest.Mock;
  kill: jest.Mock;
};

type ListedSandbox = { sandboxId: string; metadata: Record<string, string> };

const apiKey = 'test-api-key';
const sessionId = 'workspace-1:thread-1';
const timeoutMs = 600_000;
const idleTimeoutMs = 300_000;
// The resolver keeps the sandbox alive for the larger of the two.
const aliveTimeoutMs = 600_000;

// Sandbox.list() returns a paginator; emit the tagged sandboxes as a single page.
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

const buildSandboxApi = (
  overrides: Partial<SandboxApiMock> = {},
): { api: typeof Sandbox; mock: SandboxApiMock } => {
  const mock: SandboxApiMock = {
    list: jest.fn(() => paginatorOf([])),
    connect: jest.fn(),
    create: jest.fn(),
    kill: jest.fn().mockResolvedValue(true),
    ...overrides,
  };

  return { api: mock as unknown as typeof Sandbox, mock };
};

const buildFakeSandbox = (): Sandbox =>
  ({
    setTimeout: jest.fn().mockResolvedValue(undefined),
    kill: jest.fn().mockResolvedValue(undefined),
  }) as unknown as Sandbox;

const listedSandbox = (
  sandboxId: string,
  tag: string = sessionId,
): ListedSandbox => ({
  sandboxId,
  metadata: { [SESSION_SANDBOX_METADATA_KEY]: tag },
});

describe('getOrCreateSessionSandbox', () => {
  it('reuses and extends the existing sandbox for the session', async () => {
    const sandbox = buildFakeSandbox();
    const { api, mock } = buildSandboxApi({
      list: jest.fn(() => paginatorOf([listedSandbox('sbx-1')])),
      connect: jest.fn().mockResolvedValue(sandbox),
    });

    const result = await getOrCreateSessionSandbox({
      sandboxApi: api,
      apiKey,
      sessionId,
      timeoutMs,
      idleTimeoutMs,
    });

    expect(result).toEqual({ sandbox, isReused: true });
    expect(mock.list).toHaveBeenCalledWith({
      apiKey,
      query: {
        state: ['running', 'paused'],
        metadata: { [SESSION_SANDBOX_METADATA_KEY]: sessionId },
      },
    });
    expect(mock.connect).toHaveBeenCalledWith('sbx-1', { apiKey });
    expect(sandbox.setTimeout).toHaveBeenCalledWith(aliveTimeoutMs);
    expect(mock.create).not.toHaveBeenCalled();
    expect(mock.kill).not.toHaveBeenCalled();
  });

  it('creates a new tagged auto-pausing sandbox when none exists for the session', async () => {
    const sandbox = buildFakeSandbox();
    const { api, mock } = buildSandboxApi({
      list: jest.fn(() => paginatorOf([])),
      create: jest.fn().mockResolvedValue(sandbox),
    });

    const result = await getOrCreateSessionSandbox({
      sandboxApi: api,
      apiKey,
      sessionId,
      timeoutMs,
      idleTimeoutMs,
    });

    expect(result).toEqual({ sandbox, isReused: false });
    expect(mock.create).toHaveBeenCalledWith({
      apiKey,
      timeoutMs: aliveTimeoutMs,
      lifecycle: { onTimeout: 'pause', autoResume: true },
      metadata: { [SESSION_SANDBOX_METADATA_KEY]: sessionId },
    });
    expect(mock.connect).not.toHaveBeenCalled();
  });

  it('reaps duplicate sandboxes and reuses a single one', async () => {
    const keep = buildFakeSandbox();
    const { api, mock } = buildSandboxApi({
      list: jest.fn(() =>
        paginatorOf([
          listedSandbox('sbx-keep'),
          listedSandbox('sbx-dup-1'),
          listedSandbox('sbx-dup-2'),
        ]),
      ),
      connect: jest.fn().mockResolvedValue(keep),
    });

    const result = await getOrCreateSessionSandbox({
      sandboxApi: api,
      apiKey,
      sessionId,
      timeoutMs,
      idleTimeoutMs,
    });

    expect(result).toEqual({ sandbox: keep, isReused: true });
    expect(mock.connect).toHaveBeenCalledTimes(1);
    expect(mock.connect).toHaveBeenCalledWith('sbx-keep', { apiKey });
    expect(mock.kill).toHaveBeenCalledWith('sbx-dup-1', { apiKey });
    expect(mock.kill).toHaveBeenCalledWith('sbx-dup-2', { apiKey });
    expect(mock.kill).not.toHaveBeenCalledWith('sbx-keep', { apiKey });
    expect(mock.create).not.toHaveBeenCalled();
  });

  it('creates a fresh sandbox when connecting to the existing one fails', async () => {
    const created = buildFakeSandbox();
    const { api, mock } = buildSandboxApi({
      list: jest.fn(() => paginatorOf([listedSandbox('sbx-dead')])),
      connect: jest.fn().mockRejectedValue(new Error('sandbox not found')),
      create: jest.fn().mockResolvedValue(created),
    });

    const result = await getOrCreateSessionSandbox({
      sandboxApi: api,
      apiKey,
      sessionId,
      timeoutMs,
      idleTimeoutMs,
    });

    expect(result).toEqual({ sandbox: created, isReused: false });
    expect(mock.create).toHaveBeenCalledTimes(1);
  });

  it('keeps the first connectable sandbox instead of cold-creating when an earlier one is dead', async () => {
    const live = buildFakeSandbox();
    const { api, mock } = buildSandboxApi({
      list: jest.fn(() =>
        paginatorOf([listedSandbox('sbx-dead'), listedSandbox('sbx-live')]),
      ),
      connect: jest.fn((sandboxId: string) =>
        sandboxId === 'sbx-live'
          ? Promise.resolve(live)
          : Promise.reject(new Error('sandbox not found')),
      ),
    });

    const result = await getOrCreateSessionSandbox({
      sandboxApi: api,
      apiKey,
      sessionId,
      timeoutMs,
      idleTimeoutMs,
    });

    expect(result).toEqual({ sandbox: live, isReused: true });
    expect(live.setTimeout).toHaveBeenCalledWith(aliveTimeoutMs);
    expect(mock.kill).toHaveBeenCalledWith('sbx-dead', { apiKey });
    expect(mock.create).not.toHaveBeenCalled();
  });

  it('never reuses a sandbox whose metadata does not exactly match the session', async () => {
    const created = buildFakeSandbox();
    const { api, mock } = buildSandboxApi({
      // A sandbox from a different session/tenant that a loose server-side match
      // could surface — it must be ignored, never connected to or reaped.
      list: jest.fn(() =>
        paginatorOf([listedSandbox('sbx-foreign', 'workspace-2:thread-9')]),
      ),
      create: jest.fn().mockResolvedValue(created),
    });

    const result = await getOrCreateSessionSandbox({
      sandboxApi: api,
      apiKey,
      sessionId,
      timeoutMs,
      idleTimeoutMs,
    });

    expect(result).toEqual({ sandbox: created, isReused: false });
    expect(mock.connect).not.toHaveBeenCalled();
    expect(mock.kill).not.toHaveBeenCalled();
    expect(mock.create).toHaveBeenCalledTimes(1);
  });

  it('kills a connected sandbox and creates fresh when refreshing its timeout fails', async () => {
    const stale = {
      setTimeout: jest
        .fn()
        .mockRejectedValue(new Error('timeout refresh failed')),
      kill: jest.fn().mockResolvedValue(undefined),
    } as unknown as Sandbox;
    const created = buildFakeSandbox();
    const { api, mock } = buildSandboxApi({
      list: jest.fn(() => paginatorOf([listedSandbox('sbx-stale')])),
      connect: jest.fn().mockResolvedValue(stale),
      create: jest.fn().mockResolvedValue(created),
    });

    const result = await getOrCreateSessionSandbox({
      sandboxApi: api,
      apiKey,
      sessionId,
      timeoutMs,
      idleTimeoutMs,
    });

    expect(result).toEqual({ sandbox: created, isReused: false });
    expect(stale.setTimeout).toHaveBeenCalledWith(aliveTimeoutMs);
    expect(stale.kill).toHaveBeenCalledTimes(1);
    expect(mock.create).toHaveBeenCalledTimes(1);
  });
});
