import { describe, expect, it } from 'vitest';

import { DirectusAdapterImpl } from 'src/adapters/directus-adapter.interface';

describe('DirectusAdapterImpl', () => {
  const adapter = new DirectusAdapterImpl();

  it('has system set to DIRECTUS', () => {
    expect(adapter.system).toBe('DIRECTUS');
  });

  it('fetchChangedRecords throws Not implemented', async () => {
    await expect(
      adapter.fetchChangedRecords({}),
    ).rejects.toThrow('Not implemented');
  });

  it('fetchChangedRecords throws with since parameter', async () => {
    await expect(
      adapter.fetchChangedRecords({ since: '2026-01-01T00:00:00Z' }),
    ).rejects.toThrow('Not implemented');
  });

  it('fetchChangedRecords throws with collections parameter', async () => {
    await expect(
      adapter.fetchChangedRecords({ collections: ['persons', 'companies'] }),
    ).rejects.toThrow('Not implemented');
  });

  it('project throws Not implemented', async () => {
    await expect(adapter.project({})).rejects.toThrow('Not implemented');
  });

  it('project throws with a populated record', async () => {
    await expect(
      adapter.project({ id: '123', name: 'Test' }),
    ).rejects.toThrow('Not implemented');
  });
});
