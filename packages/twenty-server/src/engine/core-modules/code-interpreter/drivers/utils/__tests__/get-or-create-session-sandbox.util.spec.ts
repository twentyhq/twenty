import { type Sandbox } from '@e2b/code-interpreter';

import {
  getOrCreateSessionSandbox,
  SESSION_SANDBOX_METADATA_KEY,
} from 'src/engine/core-modules/code-interpreter/drivers/utils/get-or-create-session-sandbox.util';

type SandboxApiMock = {
  list: jest.Mock;
  connect: jest.Mock;
  create: jest.Mock;
};

const buildSandboxApi = (
  overrides: Partial<SandboxApiMock> = {},
): { api: typeof Sandbox; mock: SandboxApiMock } => {
  const mock: SandboxApiMock = {
    list: jest.fn().mockResolvedValue([]),
    connect: jest.fn(),
    create: jest.fn(),
    ...overrides,
  };

  return { api: mock as unknown as typeof Sandbox, mock };
};

const buildFakeSandbox = (): Sandbox =>
  ({
    setTimeout: jest.fn().mockResolvedValue(undefined),
    kill: jest.fn().mockResolvedValue(undefined),
  }) as unknown as Sandbox;

const apiKey = 'test-api-key';
const sessionId = 'workspace-1:thread-1';
const idleTimeoutMs = 300_000;

describe('getOrCreateSessionSandbox', () => {
  it('reuses and extends the existing sandbox for the session', async () => {
    const sandbox = buildFakeSandbox();
    const { api, mock } = buildSandboxApi({
      list: jest.fn().mockResolvedValue([{ sandboxId: 'sbx-1' }]),
      connect: jest.fn().mockResolvedValue(sandbox),
    });

    const result = await getOrCreateSessionSandbox({
      sandboxApi: api,
      apiKey,
      sessionId,
      idleTimeoutMs,
    });

    expect(result).toEqual({ sandbox, isReused: true });
    expect(mock.list).toHaveBeenCalledWith({
      apiKey,
      query: { metadata: { [SESSION_SANDBOX_METADATA_KEY]: sessionId } },
    });
    expect(mock.connect).toHaveBeenCalledWith('sbx-1', { apiKey });
    expect(sandbox.setTimeout).toHaveBeenCalledWith(idleTimeoutMs);
    expect(mock.create).not.toHaveBeenCalled();
  });

  it('creates a new tagged sandbox when none exists for the session', async () => {
    const sandbox = buildFakeSandbox();
    const { api, mock } = buildSandboxApi({
      list: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue(sandbox),
    });

    const result = await getOrCreateSessionSandbox({
      sandboxApi: api,
      apiKey,
      sessionId,
      idleTimeoutMs,
    });

    expect(result).toEqual({ sandbox, isReused: false });
    expect(mock.create).toHaveBeenCalledWith({
      apiKey,
      timeoutMs: idleTimeoutMs,
      metadata: { [SESSION_SANDBOX_METADATA_KEY]: sessionId },
    });
    expect(mock.connect).not.toHaveBeenCalled();
  });

  it('reaps duplicate sandboxes and reuses a single one', async () => {
    const sandboxesById: Record<string, Sandbox> = {
      'sbx-keep': buildFakeSandbox(),
      'sbx-dup-1': buildFakeSandbox(),
      'sbx-dup-2': buildFakeSandbox(),
    };
    const { api, mock } = buildSandboxApi({
      list: jest
        .fn()
        .mockResolvedValue([
          { sandboxId: 'sbx-keep' },
          { sandboxId: 'sbx-dup-1' },
          { sandboxId: 'sbx-dup-2' },
        ]),
      connect: jest.fn((sandboxId: string) =>
        Promise.resolve(sandboxesById[sandboxId]),
      ),
    });

    const result = await getOrCreateSessionSandbox({
      sandboxApi: api,
      apiKey,
      sessionId,
      idleTimeoutMs,
    });

    expect(result.isReused).toBe(true);
    expect(result.sandbox).toBe(sandboxesById['sbx-keep']);
    expect(sandboxesById['sbx-dup-1'].kill).toHaveBeenCalledTimes(1);
    expect(sandboxesById['sbx-dup-2'].kill).toHaveBeenCalledTimes(1);
    expect(sandboxesById['sbx-keep'].kill).not.toHaveBeenCalled();
    expect(mock.create).not.toHaveBeenCalled();
  });

  it('creates a fresh sandbox when connecting to the existing one fails', async () => {
    const created = buildFakeSandbox();
    const { api, mock } = buildSandboxApi({
      list: jest.fn().mockResolvedValue([{ sandboxId: 'sbx-dead' }]),
      connect: jest.fn().mockRejectedValue(new Error('sandbox not found')),
      create: jest.fn().mockResolvedValue(created),
    });

    const result = await getOrCreateSessionSandbox({
      sandboxApi: api,
      apiKey,
      sessionId,
      idleTimeoutMs,
    });

    expect(result).toEqual({ sandbox: created, isReused: false });
    expect(mock.create).toHaveBeenCalledTimes(1);
  });

  it('keeps the first connectable sandbox instead of cold-creating when an earlier one is dead', async () => {
    const live = buildFakeSandbox();
    const { api, mock } = buildSandboxApi({
      list: jest
        .fn()
        .mockResolvedValue([
          { sandboxId: 'sbx-dead' },
          { sandboxId: 'sbx-live' },
        ]),
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
      idleTimeoutMs,
    });

    expect(result).toEqual({ sandbox: live, isReused: true });
    expect(live.setTimeout).toHaveBeenCalledWith(idleTimeoutMs);
    expect(mock.create).not.toHaveBeenCalled();
  });
});
