import { Test, type TestingModule } from '@nestjs/testing';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { InstanceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/instance-command-runner.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import {
  type UpgradeStep,
  type WorkspaceUpgradeStep,
  UpgradeSequenceReaderService,
} from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UpgradeSequenceRunnerService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-runner.service';
import { WorkspaceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/workspace-command-runner.service';

export const makeStep = (
  kind: UpgradeStep['kind'],
  name: string,
): UpgradeStep =>
  ({
    kind,
    name,
    command: {},
    version: '1.21.0',
    timestamp: 0,
  }) as unknown as UpgradeStep;

export const makeFastInstance = (name: string) =>
  makeStep('fast-instance', name);

export const makeSlowInstance = (name: string) =>
  makeStep('slow-instance', name);

export const makeWorkspace = (name: string) =>
  makeStep('workspace', name) as WorkspaceUpgradeStep;

export const createUpgradeSequenceRunnerTestModule = async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      {
        provide: UpgradeMigrationService,
        useValue: {
          getLastAttemptedCommandNameOrThrow: jest.fn(),
          getWorkspaceLastAttemptedCommandNameOrThrow: jest.fn(),
          areAllWorkspacesAtCommand: jest.fn().mockResolvedValue(true),
        },
      },
      {
        provide: InstanceCommandRunnerService,
        useValue: {
          runFastInstanceCommand: jest
            .fn()
            .mockResolvedValue({ status: 'success' }),
          runSlowInstanceCommand: jest
            .fn()
            .mockResolvedValue({ status: 'success' }),
        },
      },
      {
        provide: WorkspaceCommandRunnerService,
        useValue: {
          runWorkspaceCommands: jest.fn().mockResolvedValue(undefined),
        },
      },
      {
        provide: UpgradeSequenceReaderService,
        useFactory: () => new UpgradeSequenceReaderService({} as any),
      },
      {
        provide: WorkspaceIteratorService,
        useValue: {
          iterate: jest.fn().mockImplementation(async (args: any) => {
            const { callback, workspaceIds } = args;
            const ids = workspaceIds ?? ['ws-1'];
            const report = { fail: [] as any[], success: [] as any[] };

            for (const [index, workspaceId] of ids.entries()) {
              try {
                await callback({
                  workspaceId,
                  index,
                  total: ids.length,
                  dataSource: {} as any,
                });
                report.success.push({ workspaceId });
              } catch (error) {
                report.fail.push({ error, workspaceId });
              }
            }

            return report;
          }),
        },
      },
      {
        provide: UpgradeSequenceRunnerService,
        useFactory: (
          upgradeMigrationService: UpgradeMigrationService,
          instanceUpgradeService: InstanceCommandRunnerService,
          workspaceUpgradeService: WorkspaceCommandRunnerService,
          upgradeSequenceReaderService: UpgradeSequenceReaderService,
          workspaceIteratorService: WorkspaceIteratorService,
        ) =>
          new UpgradeSequenceRunnerService(
            upgradeMigrationService,
            instanceUpgradeService,
            workspaceUpgradeService,
            upgradeSequenceReaderService,
            workspaceIteratorService,
          ),
        inject: [
          UpgradeMigrationService,
          InstanceCommandRunnerService,
          WorkspaceCommandRunnerService,
          UpgradeSequenceReaderService,
          WorkspaceIteratorService,
        ],
      },
    ],
  }).compile();

  const runner = module.get(UpgradeSequenceRunnerService);

  jest.spyOn(runner['logger'], 'log').mockImplementation();
  jest.spyOn(runner['logger'], 'error').mockImplementation();
  jest.spyOn(runner['logger'], 'warn').mockImplementation();

  return {
    runner,
    upgradeMigrationService: jest.mocked(module.get(UpgradeMigrationService)),
    instanceUpgradeService: jest.mocked(
      module.get(InstanceCommandRunnerService),
    ),
    workspaceUpgradeService: jest.mocked(
      module.get(WorkspaceCommandRunnerService),
    ),
    upgradeSequenceReaderService: module.get(UpgradeSequenceReaderService),
    workspaceIteratorService: jest.mocked(module.get(WorkspaceIteratorService)),
  };
};
