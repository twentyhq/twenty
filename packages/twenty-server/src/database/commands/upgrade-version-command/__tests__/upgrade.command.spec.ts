import { Logger } from '@nestjs/common';

import { type CommandShutdownService } from 'src/database/commands/command-runners/command-shutdown.service';
import { UpgradeCommand } from 'src/database/commands/upgrade-version-command/upgrade.command';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { type UpgradeSequenceRunnerService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-runner.service';
import { type UpgradeStatusService } from 'src/engine/core-modules/upgrade/services/upgrade-status.service';

const buildUpgradeCommand = ({
  totalFailures,
  continueOnWorkspaceFailure,
}: {
  totalFailures: number;
  continueOnWorkspaceFailure: boolean;
}) => {
  const upgradeSequenceReaderService = {
    getUpgradeSequence: jest.fn().mockReturnValue([]),
  } as unknown as UpgradeSequenceReaderService;
  const upgradeSequenceRunnerService = {
    run: jest.fn().mockResolvedValue({ totalSuccesses: 1, totalFailures }),
  } as unknown as UpgradeSequenceRunnerService;
  const upgradeStatusService = {
    invalidateInstanceAndAllWorkspacesStatus: jest
      .fn()
      .mockResolvedValue(undefined),
  } as unknown as UpgradeStatusService;
  const commandShutdownService = {
    listenToShutdownSignals: jest.fn(),
  } as unknown as CommandShutdownService;
  const twentyConfigService = {
    get: jest
      .fn()
      .mockImplementation((key: string) =>
        key === 'UPGRADE_CONTINUE_ON_WORKSPACE_FAILURE'
          ? continueOnWorkspaceFailure
          : undefined,
      ),
  } as unknown as TwentyConfigService;

  return new UpgradeCommand(
    upgradeSequenceReaderService,
    upgradeSequenceRunnerService,
    upgradeStatusService,
    commandShutdownService,
    twentyConfigService,
  );
};

describe('UpgradeCommand', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('resolves when every workspace upgraded', async () => {
    const command = buildUpgradeCommand({
      totalFailures: 0,
      continueOnWorkspaceFailure: false,
    });

    await expect(command.run([], {})).resolves.toBeUndefined();
  });

  it('throws when a workspace failed to upgrade', async () => {
    const command = buildUpgradeCommand({
      totalFailures: 2,
      continueOnWorkspaceFailure: false,
    });

    await expect(command.run([], {})).rejects.toThrow(
      'Upgrade completed with 2 workspace failure(s)',
    );
  });

  it('resolves despite workspace failures when UPGRADE_CONTINUE_ON_WORKSPACE_FAILURE is set', async () => {
    const command = buildUpgradeCommand({
      totalFailures: 2,
      continueOnWorkspaceFailure: true,
    });

    await expect(command.run([], {})).resolves.toBeUndefined();
  });
});
