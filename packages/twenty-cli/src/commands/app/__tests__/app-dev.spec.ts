import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runCliForTest } from '@/__tests__/utils/run-cli-for-test';
import { applyAppBuild } from '@/app/deployment/apply-app-build';
import {
  buildDevSnapshot,
  type BuiltDevSnapshot,
} from '@/app/dev/build-dev-snapshot';
import { createDevClientGenerator } from '@/app/dev/generate-dev-client';
import { watchAppInputs } from '@/app/dev/watch-app-inputs';
import { recordPullBase } from '@/app/record-pull-base';
import { resolveCommandTarget } from '@/program/resolve-command-target';
import { CliError } from '@/output/cli-error';

vi.mock('@/app/dev/build-dev-snapshot');
vi.mock('@/app/dev/watch-app-inputs');
vi.mock('@/app/dev/generate-dev-client');
vi.mock('@/app/deployment/apply-app-build');
vi.mock('@/app/record-pull-base');
vi.mock('@/app/project/resolve-app-project', () => ({
  resolveAppProject: async () => ({ path: '/test-app', name: 'test-app' }),
}));
vi.mock('@/program/resolve-command-target');

const makeSnapshot = (contentHash: string): BuiltDevSnapshot => ({
  contentHash,
  build: {
    buildId: contentHash,
    contentHash,
    directory: '/test-app/.twenty/cli/snapshots/dev-test',
    manifest: {},
    manifestFormat: 'twenty-application',
    files: [],
    application: {
      name: 'test-app',
      displayName: 'Test App',
      universalIdentifier: 'app-id',
    },
  },
  release: vi.fn(async () => {}),
  tooling: {
    version: '2.44.0',
    packagePath: '/test-app/node_modules/twenty-sdk',
  },
  diagnostics: [],
  sourceFingerprints: { 'application.config.ts': 'source-hash' },
});

let invalidate = () => {};
const close = vi.fn(async () => {});
const generateClient = vi.fn<ReturnType<typeof createDevClientGenerator>>(
  async () => 'skipped',
);

beforeEach(() => {
  vi.mocked(resolveCommandTarget).mockResolvedValue({
    apiUrl: 'http://localhost:3000',
    bearerToken: 'test-token',
    credentialKind: 'apiKey',
    source: 'environment',
  });
  vi.mocked(watchAppInputs).mockImplementation(async ({ onChange }) => {
    invalidate = onChange;
    return { close, update: vi.fn(async () => {}) };
  });
  vi.mocked(recordPullBase).mockResolvedValue('recorded');
  vi.mocked(createDevClientGenerator).mockReturnValue(generateClient);
  vi.mocked(applyAppBuild).mockResolvedValue({
    completedPhases: ['build', 'preview', 'installation', 'upload', 'sync'],
    isRegistrationCreated: false,
    acknowledgedUniversalIdentifier: 'app-id',
    appliedActions: [],
    upload: { byteCount: 0, fileCount: 0, hasCreatedTargets: false },
  });
});
afterEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
});

describe('twenty app dev', () => {
  it('rejects finite JSON before target lookup or starting a watcher', async () => {
    const result = await runCliForTest(['app', 'dev', '--json']);
    expect(JSON.parse(result.stdout)).toMatchObject({
      ok: false,
      error: { code: 'USAGE' },
    });
    expect(resolveCommandTarget).not.toHaveBeenCalled();
    expect(watchAppInputs).not.toHaveBeenCalled();
    expect(buildDevSnapshot).not.toHaveBeenCalled();
  });

  it('streams build failure and recovery, carries approvals and pull fingerprints, cleans up on Ctrl+C', async () => {
    const fixed = makeSnapshot('fixed');
    vi.mocked(buildDevSnapshot)
      .mockRejectedValueOnce(
        new CliError({
          code: 'TYPECHECK_FAILED',
          message: 'Typecheck failed.',
        }),
      )
      .mockResolvedValue(fixed);
    const session = runCliForTest([
      'app',
      'dev',
      '--format',
      'ndjson',
      '--create',
      '--yes',
      '--no-delete',
    ]);

    await vi.waitFor(() => expect(buildDevSnapshot).toHaveBeenCalledOnce());
    expect(applyAppBuild).not.toHaveBeenCalled();
    invalidate();
    await vi.waitFor(() => expect(generateClient).toHaveBeenCalledOnce());
    process.emit('SIGINT');
    const result = await session;
    const events = result.stdout
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
    expect(events.map((event) => event.data?.kind).filter(Boolean)).toEqual(
      expect.arrayContaining([
        'watch-ready',
        'build-failure',
        'build-success',
        'sync-success',
      ]),
    );
    expect(events.at(-1)).toMatchObject({
      type: 'error',
      data: { code: 'CANCELLED' },
    });
    expect(result.exitCode).toBe(130);
    expect(applyAppBuild).toHaveBeenCalledWith(
      expect.objectContaining({
        isCreationApproved: true,
        isDeletionApproved: true,
        inferDeletionFromMissingEntities: false,
      }),
    );
    expect(recordPullBase).toHaveBeenCalledWith(
      expect.objectContaining({ sourceFingerprints: fixed.sourceFingerprints }),
    );
    expect(fixed.release).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
  });

  it('keeps watching after a remote failure and requests a fresh preview only on a new revision', async () => {
    const first = makeSnapshot('same');
    const second = makeSnapshot('same');
    vi.mocked(buildDevSnapshot)
      .mockResolvedValueOnce(first)
      .mockResolvedValue(second);
    vi.mocked(applyAppBuild).mockRejectedValueOnce(
      new CliError({
        code: 'NETWORK_ERROR',
        message: 'Connection lost',
        details: {
          phase: 'sync',
          outcome: 'unknown',
          completedPhases: ['build', 'preview', 'upload'],
        },
      }),
    );
    const session = runCliForTest(['app', 'dev', '--format', 'ndjson']);

    await vi.waitFor(() => expect(applyAppBuild).toHaveBeenCalledOnce());
    await vi.waitFor(() => expect(first.release).toHaveBeenCalledOnce());
    expect(generateClient).not.toHaveBeenCalled();
    invalidate();
    await vi.waitFor(() => expect(applyAppBuild).toHaveBeenCalledTimes(2));
    await vi.waitFor(() => expect(second.release).toHaveBeenCalledOnce());
    process.emit('SIGINT');
    const result = await session;
    const failure = result.stdout
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .find((event) => event.data?.kind === 'sync-failure');
    expect(failure.data.error.details).toMatchObject({
      phase: 'sync',
      outcome: 'unknown',
    });
  });

  it('terminates with acknowledged phases if client generation fails after writing starts', async () => {
    const built = makeSnapshot('built');
    vi.mocked(buildDevSnapshot).mockResolvedValue(built);
    generateClient.mockRejectedValueOnce(
      new CliError({
        code: 'CLIENT_GENERATION_FAILED',
        message: 'Client files may be incomplete',
        details: {
          phase: 'clientGeneration',
          outcome: 'applied',
          completedPhases: ['sync', 'pullBase'],
        },
      }),
    );
    const result = await runCliForTest(['app', 'dev', '--format', 'ndjson']);
    const terminal = result.stdout
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line))
      .at(-1);
    expect(terminal).toMatchObject({
      type: 'error',
      data: {
        code: 'CLIENT_GENERATION_FAILED',
        details: { phase: 'clientGeneration', outcome: 'applied' },
      },
    });
    expect(buildDevSnapshot).toHaveBeenCalledOnce();
    expect(built.release).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
  });
  it('preserves the remote phase and unknown outcome on Ctrl+C', async () => {
    const built = makeSnapshot('cancelled');
    vi.mocked(buildDevSnapshot).mockResolvedValue(built);
    vi.mocked(applyAppBuild).mockImplementation(
      async ({ context: { signal } }) =>
        new Promise((_, reject) => {
          signal.addEventListener(
            'abort',
            () =>
              reject(
                new CliError({
                  code: 'CANCELLED',
                  exitCode: 130,
                  message: 'Sync interrupted',
                  details: {
                    phase: 'sync',
                    outcome: 'unknown',
                    completedPhases: ['build', 'preview', 'upload'],
                  },
                }),
              ),
            { once: true },
          );
        }),
    );
    const session = runCliForTest(['app', 'dev', '--format', 'ndjson']);
    await vi.waitFor(() => expect(applyAppBuild).toHaveBeenCalledOnce());
    process.emit('SIGINT');
    const result = await session;
    const terminal = result.stdout
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line))
      .at(-1);
    expect(result.exitCode).toBe(130);
    expect(terminal).toMatchObject({
      type: 'error',
      data: {
        code: 'CANCELLED',
        details: { phase: 'sync', outcome: 'unknown' },
      },
    });
    expect(built.release).toHaveBeenCalledOnce();
  });

  it('makes abnormal worker termination actionable and stops watching', async () => {
    vi.mocked(buildDevSnapshot).mockRejectedValue(
      new CliError({
        code: 'WORKER_FAILED',
        message: 'The worker exited early',
      }),
    );
    const result = await runCliForTest(['app', 'dev', '--format', 'ndjson']);
    const terminal = result.stdout
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line))
      .at(-1);
    expect(terminal).toMatchObject({
      type: 'error',
      data: {
        code: 'WORKER_FAILED',
        hint: expect.stringContaining('restart twenty app dev'),
      },
    });
    expect(close).toHaveBeenCalledOnce();
  });
});
