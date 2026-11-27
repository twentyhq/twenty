import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listScopes: vi.fn(),
  createScope: vi.fn(),
  kvStore: new Map<string, unknown>(),
}));

vi.mock('@unipile/sdk', () => ({
  UnipileScopes: class {
    listScopes = mocks.listScopes;
    createScope = mocks.createScope;
  },
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: {
    get: async (key: string) => mocks.kvStore.get(key) ?? null,
    set: async (key: string, value: unknown) => {
      mocks.kvStore.set(key, value);
    },
  },
}));

const { getOrCreateUnipileWorkspaceScopeId } =
  await import('src/unipile/utils/get-or-create-unipile-workspace-scope-id.util');

const WORKSPACE_ID = '3bba047b-6b10-4d21-8d97-0f6b6d0a7c11';

const buildScope = (id: string, reference: string | null) => ({
  object: 'Scope',
  id,
  reference,
  status: 'active',
});

describe('getOrCreateUnipileWorkspaceScopeId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('UNIPILE_API_KEY', 'unipile-key');
    mocks.kvStore.clear();
    mocks.listScopes.mockResolvedValue({ data: { data: [] } });
  });

  it('reuses the Scope already stored for the workspace', async () => {
    mocks.kvStore.set('unipile-workspace-scope-id', 'scp_cached');

    await expect(
      getOrCreateUnipileWorkspaceScopeId(WORKSPACE_ID),
    ).resolves.toBe('scp_cached');
    expect(mocks.listScopes).not.toHaveBeenCalled();
  });

  it('finds the Scope whose reference is the workspace id', async () => {
    mocks.listScopes.mockResolvedValue({
      data: {
        data: [
          buildScope('scp_other', `${WORKSPACE_ID}-other`),
          buildScope('scp_workspace', WORKSPACE_ID),
        ],
      },
    });

    await expect(
      getOrCreateUnipileWorkspaceScopeId(WORKSPACE_ID),
    ).resolves.toBe('scp_workspace');
    expect(mocks.listScopes.mock.calls[0][0].query).toEqual({
      search: WORKSPACE_ID,
    });
    expect(mocks.createScope).not.toHaveBeenCalled();
    expect(mocks.kvStore.get('unipile-workspace-scope-id')).toBe(
      'scp_workspace',
    );
  });

  it('creates a Scope referencing the workspace when none exists', async () => {
    mocks.createScope.mockResolvedValue({
      data: buildScope('scp_new', WORKSPACE_ID),
    });

    await expect(
      getOrCreateUnipileWorkspaceScopeId(WORKSPACE_ID),
    ).resolves.toBe('scp_new');
    expect(mocks.createScope.mock.calls[0][0].body).toEqual({
      name: `Twenty workspace ${WORKSPACE_ID}`,
      reference: WORKSPACE_ID,
    });
    expect(mocks.kvStore.get('unipile-workspace-scope-id')).toBe('scp_new');
  });

  it('uses the Scope a concurrent connection created first', async () => {
    mocks.listScopes
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockResolvedValueOnce({
        data: { data: [buildScope('scp_concurrent', WORKSPACE_ID)] },
      });
    mocks.createScope.mockRejectedValue(new Error('Reference already used'));

    await expect(
      getOrCreateUnipileWorkspaceScopeId(WORKSPACE_ID),
    ).resolves.toBe('scp_concurrent');
  });

  it('fails when the Scope can be neither created nor found', async () => {
    mocks.createScope.mockRejectedValue(new Error('Unipile is down'));

    await expect(
      getOrCreateUnipileWorkspaceScopeId(WORKSPACE_ID),
    ).rejects.toThrow('Unipile is down');
    expect(mocks.kvStore.has('unipile-workspace-scope-id')).toBe(false);
  });
});
