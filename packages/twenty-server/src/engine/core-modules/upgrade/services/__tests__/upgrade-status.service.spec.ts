import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { TWENTY_CROSS_UPGRADE_SUPPORTED_VERSIONS } from 'src/engine/core-modules/upgrade/constants/twenty-cross-upgrade-supported-version.constant';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UpgradeStatusCacheService } from 'src/engine/core-modules/upgrade/services/upgrade-status-cache.service';
import { UpgradeStatusService } from 'src/engine/core-modules/upgrade/services/upgrade-status.service';
import { type UpgradeCursor } from 'src/engine/core-modules/upgrade/utils/resolve-completed-version-from-cursor.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const [OLDEST_VERSION, MIDDLE_VERSION, NEWEST_VERSION] =
  TWENTY_CROSS_UPGRADE_SUPPORTED_VERSIONS.slice(-3);
const OLDEST_COMMAND = `${OLDEST_VERSION}_WorkspaceCommand_1`;
const MIDDLE_COMMAND = `${MIDDLE_VERSION}_WorkspaceCommand_2`;
const MIDDLE_LAST_COMMAND = `${MIDDLE_VERSION}_WorkspaceCommand_3`;
const NEWEST_WORKSPACE_COMMAND = `${NEWEST_VERSION}_WorkspaceCommand_4`;
const NEWEST_INSTANCE_COMMAND = `${NEWEST_VERSION}_SlowInstanceCommand_5`;
const WORKSPACE_ID = 'workspace-id';

describe('UpgradeStatusService completed versions', () => {
  let service: UpgradeStatusService;
  const getWorkspaceLastAttemptedCommandName = jest.fn();
  const getLastAttemptedInstanceCommand = jest.fn();
  const getUpgradeStepNames = jest.fn();

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UpgradeStatusService,
        {
          provide: UpgradeMigrationService,
          useValue: {
            getWorkspaceLastAttemptedCommandName,
            getLastAttemptedInstanceCommand,
          },
        },
        {
          provide: UpgradeSequenceReaderService,
          useValue: { getUpgradeStepNames },
        },
        { provide: UpgradeStatusCacheService, useValue: {} },
        { provide: getRepositoryToken(WorkspaceEntity), useValue: {} },
      ],
    }).compile();

    service = module.get(UpgradeStatusService);
  });

  it.each<{
    description: string;
    stepNames: string[];
    cursor: UpgradeCursor | null;
    expectedVersion: string | null;
  }>([
    {
      description: 'credits trailing versions with no upgrade commands',
      stepNames: [OLDEST_COMMAND],
      cursor: { name: OLDEST_COMMAND, status: 'completed' },
      expectedVersion: NEWEST_VERSION,
    },
    {
      description: 'stops before a pending workspace command',
      stepNames: [MIDDLE_COMMAND, NEWEST_WORKSPACE_COMMAND],
      cursor: { name: MIDDLE_COMMAND, status: 'completed' },
      expectedVersion: MIDDLE_VERSION,
    },
    {
      description: 'stops before a pending instance command',
      stepNames: [MIDDLE_COMMAND, NEWEST_INSTANCE_COMMAND],
      cursor: { name: MIDDLE_COMMAND, status: 'completed' },
      expectedVersion: MIDDLE_VERSION,
    },
    {
      description: 'does not credit a failed upgrade',
      stepNames: [MIDDLE_COMMAND, NEWEST_WORKSPACE_COMMAND],
      cursor: { name: NEWEST_WORKSPACE_COMMAND, status: 'failed' },
      expectedVersion: MIDDLE_VERSION,
    },
    {
      description: 'does not skip an incomplete version for an empty one',
      stepNames: [OLDEST_COMMAND, MIDDLE_COMMAND, MIDDLE_LAST_COMMAND],
      cursor: { name: MIDDLE_COMMAND, status: 'completed' },
      expectedVersion: OLDEST_VERSION,
    },
    {
      description: 'credits empty versions after a successful retry',
      stepNames: [OLDEST_COMMAND, MIDDLE_COMMAND, MIDDLE_LAST_COMMAND],
      cursor: { name: MIDDLE_LAST_COMMAND, status: 'completed' },
      expectedVersion: NEWEST_VERSION,
    },
    {
      description: 'rejects an unknown cursor',
      stepNames: [MIDDLE_COMMAND],
      cursor: { name: 'unknown-command', status: 'completed' },
      expectedVersion: null,
    },
    {
      description: 'rejects a missing cursor',
      stepNames: [MIDDLE_COMMAND],
      cursor: null,
      expectedVersion: null,
    },
  ])('$description', async ({ stepNames, cursor, expectedVersion }) => {
    getUpgradeStepNames.mockReturnValue(stepNames);
    getWorkspaceLastAttemptedCommandName.mockResolvedValue(
      new Map(cursor ? [[WORKSPACE_ID, cursor]] : []),
    );

    await expect(
      service.getWorkspaceCompletedVersion(WORKSPACE_ID),
    ).resolves.toBe(expectedVersion);
  });

  it('preserves instance version inference across empty versions', async () => {
    getUpgradeStepNames.mockReturnValue([MIDDLE_COMMAND]);
    getLastAttemptedInstanceCommand.mockResolvedValue({
      name: MIDDLE_COMMAND,
      status: 'completed',
    });

    await expect(service.getInstanceCompletedVersion()).resolves.toBe(
      NEWEST_VERSION,
    );
    expect(getUpgradeStepNames).toHaveBeenCalledWith({
      'fast-instance': true,
      'slow-instance': true,
    });
  });
});
