import { ApplicationApi } from '@/cli/utilities/api/application-api';
import { type AxiosInstance } from 'axios';
import { type Manifest } from 'twenty-shared/application';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const MANIFEST = {
  application: { universalIdentifier: 'app', displayName: 'App' },
} as unknown as Manifest;

describe('ApplicationApi.syncApplication', () => {
  const post = vi.fn();
  const api = new ApplicationApi({ post } as unknown as AxiosInstance);

  beforeEach(() => {
    post.mockReset();
    post.mockResolvedValue({
      data: {
        data: {
          syncApplication: {
            applicationUniversalIdentifier: 'app',
            actions: [],
          },
        },
      },
    });
  });

  const sentOperation = () =>
    post.mock.calls[0][1] as {
      query: string;
      variables: Record<string, unknown>;
    };

  it('sends only the manifest by default', async () => {
    await api.syncApplication(MANIFEST);

    const { query, variables } = sentOperation();

    expect(query).toContain('mutation SyncApplication($manifest: JSON!)');
    expect(query).toContain('syncApplication(manifest: $manifest)');
    expect(variables).toEqual({ manifest: MANIFEST });
  });

  it('declares dryRun only when requested', async () => {
    await api.syncApplication(MANIFEST, { dryRun: true });

    const { query, variables } = sentOperation();

    expect(query).toContain('$dryRun: Boolean');
    expect(query).toContain('dryRun: $dryRun');
    expect(query).not.toContain('inferDeletionFromMissingEntities');
    expect(variables).toEqual({ manifest: MANIFEST, dryRun: true });
  });

  it('declares inferDeletionFromMissingEntities only when deletions are turned off', async () => {
    await api.syncApplication(MANIFEST, {
      inferDeletionFromMissingEntities: false,
    });

    const { query, variables } = sentOperation();

    expect(query).toContain('$inferDeletionFromMissingEntities: Boolean');
    expect(query).toContain(
      'inferDeletionFromMissingEntities: $inferDeletionFromMissingEntities',
    );
    expect(query).not.toContain('dryRun');
    expect(variables).toEqual({
      manifest: MANIFEST,
      inferDeletionFromMissingEntities: false,
    });
  });

  it('leaves the default deletion behaviour implicit', async () => {
    await api.syncApplication(MANIFEST, {
      dryRun: true,
      inferDeletionFromMissingEntities: true,
    });

    const { query, variables } = sentOperation();

    expect(query).not.toContain('inferDeletionFromMissingEntities');
    expect(variables).toEqual({ manifest: MANIFEST, dryRun: true });
  });

  it('declares both arguments for an additive plan', async () => {
    await api.syncApplication(MANIFEST, {
      dryRun: true,
      inferDeletionFromMissingEntities: false,
    });

    const { variables } = sentOperation();

    expect(variables).toEqual({
      manifest: MANIFEST,
      dryRun: true,
      inferDeletionFromMissingEntities: false,
    });
  });
});
