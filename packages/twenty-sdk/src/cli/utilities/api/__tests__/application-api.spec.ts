import { ApplicationApi } from '@/cli/utilities/api/application-api';
import { AxiosError, AxiosHeaders, type AxiosInstance } from 'axios';
import semver from 'semver';
import { type Manifest } from 'twenty-shared/application';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import sdkPackageJson from '../../../../../package.json';

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
            serverVersion: null,
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

  describe('server version guard', () => {
    const SUPPORTED_SERVER_VERSION = semver.minVersion(
      sdkPackageJson.engines.twenty,
    )?.version;

    const mockSyncResponse = (serverVersion: string | null | undefined) =>
      post.mockResolvedValue({
        data: {
          data: {
            syncApplication: {
              applicationUniversalIdentifier: 'app',
              actions: [],
              serverVersion,
            },
          },
        },
      });

    it('requests the server version', async () => {
      await api.syncApplication(MANIFEST);

      expect(sentOperation().query).toContain('serverVersion');
    });

    it('succeeds when the server version is supported', async () => {
      mockSyncResponse(SUPPORTED_SERVER_VERSION);

      const result = await api.syncApplication(MANIFEST, { dryRun: true });

      expect(result).toMatchObject({
        success: true,
        data: { serverVersion: SUPPORTED_SERVER_VERSION },
      });
    });

    it('fails when the server version is outside the supported range', async () => {
      mockSyncResponse('0.0.1');

      const result = await api.syncApplication(MANIFEST, { dryRun: true });

      expect(result.success).toBe(false);
      expect(result.message).toContain(
        `requires Twenty server ${sdkPackageJson.engines.twenty}, but this server is 0.0.1`,
      );
    });

    it('fails when the server rejects the version field in the response body', async () => {
      post.mockResolvedValue({
        data: {
          errors: [
            {
              message:
                'Cannot query field "serverVersion" on type "WorkspaceMigration".',
              extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
            },
          ],
        },
      });

      const result = await api.syncApplication(MANIFEST);

      expect(result).toEqual({
        success: false,
        message: expect.stringContaining(
          'this server is too old to report its version',
        ),
      });
    });

    it('fails when the server rejects the version field with an HTTP error', async () => {
      post.mockRejectedValue(
        new AxiosError(
          'Request failed with status code 400',
          'ERR_BAD_REQUEST',
          undefined,
          undefined,
          {
            status: 400,
            statusText: 'Bad Request',
            headers: {},
            config: { headers: new AxiosHeaders() },
            data: {
              errors: [
                {
                  message:
                    'Cannot query field "serverVersion" on type "WorkspaceMigration".',
                },
              ],
            },
          },
        ),
      );

      const result = await api.syncApplication(MANIFEST);

      expect(result.success).toBe(false);
      expect(result.message).toContain(
        'this server is too old to report its version',
      );
    });

    it('keeps other GraphQL errors untouched', async () => {
      post.mockResolvedValue({
        data: {
          errors: [
            {
              message: 'Application not found in workspace.',
              extensions: { subCode: 'APPLICATION_NOT_FOUND' },
            },
          ],
        },
      });

      const result = await api.syncApplication(MANIFEST);

      expect(result).toEqual({
        success: false,
        error: { subCode: 'APPLICATION_NOT_FOUND' },
        message: 'Application not found in workspace.',
      });
    });
  });
});
