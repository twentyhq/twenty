import { beforeEach, describe, expect, it, vi } from 'vitest';

import { applyAppBuild } from '@/app/deployment/apply-app-build';
import { fetchAppPlan } from '@/app/deployment/fetch-app-plan';
import { installDevelopmentApp } from '@/app/deployment/install-development-app';
import { requireApproval } from '@/app/deployment/require-approval';
import { syncAppManifest } from '@/app/deployment/sync-app-manifest';
import { type ToolingBuild } from '@/app/types/tooling-result.type';
import { uploadAppFiles } from '@/app/deployment/upload-app-files';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';

vi.mock('@/app/deployment/fetch-app-plan');
vi.mock('@/app/deployment/install-development-app');
vi.mock('@/app/deployment/require-approval');
vi.mock('@/app/deployment/sync-app-manifest');
vi.mock('@/app/deployment/upload-app-files');

const build: ToolingBuild = {
  buildId: 'first',
  contentHash: 'first',
  directory: '/app/.twenty/cli/snapshots/dev-first',
  application: { name: 'app', displayName: 'App', universalIdentifier: 'id' },
  manifest: {},
  manifestFormat: 'twenty-application',
  files: [],
};
const context: TargetCommandContext = {
  command: 'app dev',
  arguments: [],
  options: {},
  outputMode: 'human',
  signal: new AbortController().signal,
  target: {
    apiUrl: 'http://localhost:3000',
    bearerToken: 'test',
    credentialKind: 'apiKey',
    source: 'environment',
  },
  output: {
    event: vi.fn(),
    progress: vi.fn(),
    warn: vi.fn(),
    succeed: vi.fn(),
    fail: vi.fn(),
  },
};
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(fetchAppPlan).mockResolvedValue([
    {
      type: 'delete',
      metadataName: 'objectMetadata',
      flatEntity: { nameSingular: 'invoice' },
    },
  ]);
  vi.mocked(installDevelopmentApp).mockResolvedValue({ applicationId: 'id' });
  vi.mocked(uploadAppFiles).mockResolvedValue(undefined);
  vi.mocked(syncAppManifest).mockResolvedValue({
    actions: [],
    acknowledgedUniversalIdentifier: 'id',
  });
});

describe('dev apply approvals', () => {
  it('flushes the preview before prompting and rejects an answer for an edited revision', async () => {
    const approval = Promise.withResolvers<void>();
    const controller = new AbortController();
    let wasPreviewFlushed = false;
    vi.mocked(requireApproval).mockImplementation(async () => {
      expect(wasPreviewFlushed).toBe(true);
      return approval.promise;
    });
    const applying = applyAppBuild({
      build,
      appPath: '/app',
      context,
      inferDeletionFromMissingEntities: true,
      isCreationApproved: false,
      isDeletionApproved: false,
      approvalSignal: controller.signal,
      flushProgress: async () => {
        wasPreviewFlushed = true;
      },
      beforeWrite: () => controller.signal.throwIfAborted(),
    });
    const failure = expect(applying).rejects.toMatchObject({
      details: { phase: 'confirmation', outcome: 'not-started' },
    });
    await vi.waitFor(() => expect(requireApproval).toHaveBeenCalledOnce());
    controller.abort();
    approval.resolve();
    await failure;
    expect(installDevelopmentApp).not.toHaveBeenCalled();
    expect(uploadAppFiles).not.toHaveBeenCalled();
    expect(syncAppManifest).not.toHaveBeenCalled();
  });

  it('checks freshness after output backpressure, immediately before the first remote write', async () => {
    vi.mocked(fetchAppPlan).mockResolvedValue([]);
    const controller = new AbortController();
    await expect(
      applyAppBuild({
        build,
        appPath: '/app',
        context,
        inferDeletionFromMissingEntities: true,
        isCreationApproved: true,
        isDeletionApproved: true,
        approvalSignal: controller.signal,
        flushProgress: async () => {
          controller.abort();
        },
        beforeWrite: () => controller.signal.throwIfAborted(),
      }),
    ).rejects.toMatchObject({ details: { phase: 'confirmation' } });
    expect(installDevelopmentApp).not.toHaveBeenCalled();
  });
  it('keeps completed phases when output is interrupted between remote operations', async () => {
    vi.mocked(fetchAppPlan).mockResolvedValue([]);
    const controller = new AbortController();
    const cancelledContext = { ...context, signal: controller.signal };
    let flushes = 0;
    await expect(
      applyAppBuild({
        build,
        appPath: '/app',
        context: cancelledContext,
        inferDeletionFromMissingEntities: true,
        isCreationApproved: true,
        isDeletionApproved: true,
        flushProgress: async () => {
          flushes += 1;
          if (flushes === 2) {
            controller.abort();
            throw controller.signal.reason;
          }
        },
      }),
    ).rejects.toMatchObject({
      code: 'CANCELLED',
      details: {
        completedPhases: ['build', 'preview', 'installation'],
        outcome: 'not-started',
      },
    });
    expect(uploadAppFiles).not.toHaveBeenCalled();
  });
});
