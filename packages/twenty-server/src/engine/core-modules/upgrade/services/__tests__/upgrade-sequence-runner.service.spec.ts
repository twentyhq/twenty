import { Logger } from '@nestjs/common';

import { type CommandShutdownService } from 'src/database/commands/command-runners/command-shutdown.service';
import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type InstanceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/instance-command-runner.service';
import { type UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import {
  type UpgradeMigrationService,
  type WorkspaceLastAttemptedCommand,
} from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import {
  type UpgradeStep,
  UpgradeSequenceReaderService,
} from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UpgradeSequenceRunnerService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-runner.service';
import { type WorkspaceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/workspace-command-runner.service';
import { type UpgradeAwareEntityMetadataAdapter } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-entity-metadata.adapter';
import { type WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';

describe('UpgradeSequenceRunnerService workspace deletion', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createRunner = ({
    remainingWorkspaceIds,
    liveWorkspaceFailed = false,
  }: {
    remainingWorkspaceIds: string[];
    liveWorkspaceFailed?: boolean;
  }) => {
    let segmentCompleted = false;
    const initialWorkspaceIds = ['deleted-workspace', ...remainingWorkspaceIds];
    const readCursors = jest.fn(async (workspaceIds: string[]) => {
      if (segmentCompleted && workspaceIds.includes('deleted-workspace')) {
        throw new Error('No upgrade migration found for deleted-workspace');
      }

      return new Map(
        workspaceIds.map((workspaceId) => [
          workspaceId,
          {
            workspaceId,
            name: segmentCompleted ? 'workspace-step' : 'initial-step',
            status: 'completed',
          } as WorkspaceLastAttemptedCommand,
        ]),
      );
    });
    const iterate = jest.fn(async () => {
      segmentCompleted = true;

      return {
        success: liveWorkspaceFailed
          ? []
          : remainingWorkspaceIds.map((workspaceId) => ({ workspaceId })),
        fail: liveWorkspaceFailed
          ? [
              {
                workspaceId: 'live-workspace',
                error: new Error('command failed'),
              },
            ]
          : [],
        skipped: [{ workspaceId: 'deleted-workspace' }],
        interrupted: false,
      };
    });
    const runFastInstanceCommand = jest
      .fn()
      .mockResolvedValue({ status: 'completed' });
    const runner = new UpgradeSequenceRunnerService(
      {
        getLastAttemptedCommandNameOrThrow: jest.fn().mockResolvedValue({
          name: 'initial-step',
          status: 'completed',
        }),
        getWorkspaceLastAttemptedCommandNameOrThrow: readCursors,
      } as unknown as UpgradeMigrationService,
      { runFastInstanceCommand } as unknown as InstanceCommandRunnerService,
      {} as WorkspaceCommandRunnerService,
      new UpgradeSequenceReaderService({} as UpgradeCommandRegistryService),
      { refresh: jest.fn() } as unknown as UpgradeAwareEntityMetadataAdapter,
      { iterate } as unknown as WorkspaceIteratorService,
      {
        getProvisionedWorkspaceIds: jest.fn(async () =>
          segmentCompleted ? remainingWorkspaceIds : initialWorkspaceIds,
        ),
      } as unknown as WorkspaceVersionService,
      {
        isShutdownRequested: jest.fn().mockReturnValue(false),
      } as unknown as CommandShutdownService,
    );
    const sequence = [
      { kind: 'fast-instance', name: 'initial-step' },
      { kind: 'workspace', name: 'workspace-step' },
      { kind: 'fast-instance', name: 'next-instance-step' },
      { kind: 'workspace', name: 'next-workspace-step' },
    ] as UpgradeStep[];

    return { runner, sequence, iterate, runFastInstanceCommand };
  };

  it('removes deleted targets before reading cursors and enforcing the next instance barrier', async () => {
    const { runner, sequence, runFastInstanceCommand } = createRunner({
      remainingWorkspaceIds: ['live-workspace'],
    });

    const report = await runner.run({
      sequence: sequence.slice(0, 3),
      options: {},
    });

    expect(report).toEqual({ totalSuccesses: 1, totalFailures: 0 });
    expect(runFastInstanceCommand).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'next-instance-step' }),
    );
  });

  it('does not expand an empty target list into an unfiltered iteration after all targets are deleted', async () => {
    const { runner, sequence, iterate, runFastInstanceCommand } = createRunner({
      remainingWorkspaceIds: [],
    });

    const report = await runner.run({ sequence, options: {} });

    expect(report).toEqual({ totalSuccesses: 0, totalFailures: 0 });
    expect(runFastInstanceCommand).toHaveBeenCalledTimes(1);
    expect(iterate).toHaveBeenCalledTimes(1);
  });

  it('still aborts before the next instance command when a live workspace fails', async () => {
    const { runner, sequence, runFastInstanceCommand } = createRunner({
      remainingWorkspaceIds: ['live-workspace'],
      liveWorkspaceFailed: true,
    });

    const report = await runner.run({ sequence, options: {} });

    expect(report.totalFailures).toBe(1);
    expect(runFastInstanceCommand).not.toHaveBeenCalled();
  });
});
