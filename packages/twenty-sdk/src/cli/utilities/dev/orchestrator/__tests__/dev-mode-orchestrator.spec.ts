import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/cli/utilities/api/api-service', () => ({
  ApiService: class ApiService {},
}));
vi.mock('@/cli/utilities/auth/build-app-token-pair-fetcher', () => ({
  buildAppTokenPairFetcher: vi.fn(),
}));
vi.mock('@/cli/utilities/client/client-service', () => ({
  ClientService: class ClientService {},
}));
vi.mock('@/cli/utilities/config/config-service', () => ({
  ConfigService: class ConfigService {
    static getActiveRemote() {
      return 'test';
    }
  },
}));
vi.mock(
  '@/cli/utilities/dev/orchestrator/steps/build-manifest-orchestrator-step',
  () => ({ BuildManifestOrchestratorStep: class {} }),
);
vi.mock(
  '@/cli/utilities/dev/orchestrator/steps/check-server-orchestrator-step',
  () => ({ CheckServerOrchestratorStep: class {} }),
);
vi.mock(
  '@/cli/utilities/dev/orchestrator/steps/generate-api-client-orchestrator-step',
  () => ({ GenerateApiClientOrchestratorStep: class {} }),
);
vi.mock(
  '@/cli/utilities/dev/orchestrator/steps/register-app-orchestrator-step',
  () => ({ RegisterAppOrchestratorStep: class {} }),
);
vi.mock(
  '@/cli/utilities/dev/orchestrator/steps/start-watchers-orchestrator-step',
  () => ({
    StartWatchersOrchestratorStep: class {
      async close() {}
    },
  }),
);
vi.mock(
  '@/cli/utilities/dev/orchestrator/steps/sync-application-orchestrator-step',
  () => ({ SyncApplicationOrchestratorStep: class {} }),
);
vi.mock(
  '@/cli/utilities/dev/orchestrator/steps/upload-files-orchestrator-step',
  () => ({ UploadFilesOrchestratorStep: class {} }),
);
vi.mock('@/cli/utilities/error/serialize-error', () => ({
  serializeError: vi.fn(),
}));
vi.mock('@/cli/utilities/file/fs-utils', () => ({
  emptyDir: vi.fn(),
  ensureDir: vi.fn(),
}));
vi.mock('twenty-shared/application', () => ({
  OUTPUT_DIR: '.twenty',
  SyncableEntity: {
    Object: 'object',
    Field: 'field',
    LogicFunction: 'logicFunction',
    FrontComponent: 'frontComponent',
    Role: 'role',
    Skill: 'skill',
    ConnectionProvider: 'connectionProvider',
    View: 'view',
    ViewField: 'viewField',
    NavigationMenuItem: 'navigationMenuItem',
    PageLayout: 'pageLayout',
    PageLayoutTab: 'pageLayoutTab',
    CommandMenuItem: 'commandMenuItem',
  },
}));

import { DevModeOrchestrator } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator';
import { OrchestratorState } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';

type DevModeOrchestratorTestHarness = {
  runSyncPipeline: () => Promise<void>;
  scheduleSync: () => void;
};

describe('DevModeOrchestrator', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs another sync when changes arrive during an active sync', async () => {
    vi.useFakeTimers();

    const state = new OrchestratorState({ appPath: '/tmp/app' });
    const orchestrator = new DevModeOrchestrator({
      state,
      debounceMs: 10,
    });
    const testHarness =
      orchestrator as unknown as DevModeOrchestratorTestHarness;
    let resolveFirstSync: (() => void) | undefined;
    const firstSync = new Promise<void>((resolve) => {
      resolveFirstSync = resolve;
    });
    const runSyncPipeline = vi
      .fn<() => Promise<void>>()
      .mockImplementationOnce(() => firstSync)
      .mockResolvedValueOnce();

    testHarness.runSyncPipeline = runSyncPipeline;

    testHarness.scheduleSync();
    await vi.advanceTimersByTimeAsync(10);

    testHarness.scheduleSync();
    await vi.advanceTimersByTimeAsync(10);

    expect(runSyncPipeline).toHaveBeenCalledTimes(1);

    resolveFirstSync?.();
    await firstSync;
    await vi.advanceTimersByTimeAsync(10);

    expect(runSyncPipeline).toHaveBeenCalledTimes(2);
  });

  it('cancels a scheduled sync when closed', async () => {
    vi.useFakeTimers();

    const state = new OrchestratorState({ appPath: '/tmp/app' });
    const orchestrator = new DevModeOrchestrator({
      state,
      debounceMs: 10,
    });
    const testHarness =
      orchestrator as unknown as DevModeOrchestratorTestHarness;
    const runSyncPipeline = vi.fn<() => Promise<void>>().mockResolvedValue();

    testHarness.runSyncPipeline = runSyncPipeline;
    testHarness.scheduleSync();

    await orchestrator.close();
    await vi.advanceTimersByTimeAsync(10);

    expect(runSyncPipeline).not.toHaveBeenCalled();
  });
});
