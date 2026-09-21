import { Logger } from '@nestjs/common';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { WorkspaceCommandRunner } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  type WorkspaceIteratorReport,
  type WorkspaceIteratorService,
} from 'src/database/commands/command-runners/workspace-iterator.service';

class TestWorkspaceCommand extends WorkspaceCommandRunner {
  runOnWorkspace = jest.fn().mockResolvedValue(undefined);
}

describe('WorkspaceCommandRunner failure reporting', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const runWithReport = (report: WorkspaceIteratorReport) => {
    const iterator = {
      listenToShutdownSignals: jest.fn(),
      iterate: jest.fn().mockResolvedValue(report),
    } satisfies Pick<
      WorkspaceIteratorService,
      'listenToShutdownSignals' | 'iterate'
    >;

    return new TestWorkspaceCommand(iterator, [
      WorkspaceActivationStatus.ACTIVE,
    ]).run([], {});
  };

  it('succeeds when every workspace completed', async () => {
    await expect(
      runWithReport({
        success: [{ workspaceId: 'successful-workspace' }],
        fail: [],
        interrupted: false,
      }),
    ).resolves.toBeUndefined();
  });

  it.each([false, true])(
    'rejects reported failures even when interrupted=%s',
    async (interrupted) => {
      await expect(
        runWithReport({
          success: [{ workspaceId: 'successful-workspace' }],
          fail: [
            {
              workspaceId: 'busy-workspace',
              error: new Error('Agent streams are still active'),
            },
            {
              workspaceId: 'invalid-workspace',
              error: new Error('History verification failed'),
            },
          ],
          interrupted,
        }),
      ).rejects.toThrow('Command failed for 2 workspace(s)');
    },
  );

  it('preserves graceful interruption when no workspace failed', async () => {
    await expect(
      runWithReport({ success: [], fail: [], interrupted: true }),
    ).resolves.toBeUndefined();
  });
});
