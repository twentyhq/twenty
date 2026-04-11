import {
  type UpgradeStep,
  type WorkspaceUpgradeStep,
  UpgradeSequenceReaderService,
} from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UpgradeSequenceRunnerService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-runner.service';

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

export const createMocks = () => {
  const upgradeMigrationService = {
    getLastAttemptedCommandNameOrThrow: jest.fn(),
    getWorkspaceLastAttemptedCommandNameOrThrow: jest.fn(),
    areAllWorkspacesAtCommand: jest.fn().mockResolvedValue(true),
  };

  const instanceUpgradeService = {
    runFastInstanceCommand: jest
      .fn()
      .mockResolvedValue({ status: 'success' }),
    runSlowInstanceCommand: jest
      .fn()
      .mockResolvedValue({ status: 'success' }),
  };

  const workspaceUpgradeService = {
    runWorkspaceCommands: jest.fn().mockResolvedValue(undefined),
  };

  const upgradeSequenceReaderService = new UpgradeSequenceReaderService(
    {} as any,
  );

  const workspaceIteratorService = {
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
  };

  const runner = new UpgradeSequenceRunnerService(
    upgradeMigrationService as any,
    instanceUpgradeService as any,
    workspaceUpgradeService as any,
    upgradeSequenceReaderService,
    workspaceIteratorService as any,
  );

  jest.spyOn(runner['logger'], 'log').mockImplementation();
  jest.spyOn(runner['logger'], 'error').mockImplementation();
  jest.spyOn(runner['logger'], 'warn').mockImplementation();

  return {
    runner,
    upgradeMigrationService,
    instanceUpgradeService,
    workspaceUpgradeService,
    upgradeSequenceReaderService,
    workspaceIteratorService,
  };
};
