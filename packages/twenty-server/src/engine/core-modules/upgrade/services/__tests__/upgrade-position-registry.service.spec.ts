import 'reflect-metadata';

import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';

import { type DataSource } from 'typeorm';

import { UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradePositionRegistry } from 'src/engine/core-modules/upgrade/services/upgrade-position-registry.service';

const REGISTERED_CMDS = [
  '2.5.0_FirstCommand_1700000000000',
  '2.6.0_SecondCommand_1700000000001',
  '2.6.0_ThirdCommand_1700000000002',
];

const buildRegistry = async ({
  completedCommandNames = [],
  knownCommandNames = REGISTERED_CMDS,
}: {
  completedCommandNames?: string[];
  knownCommandNames?: string[];
} = {}): Promise<{
  registry: UpgradePositionRegistry;
  upgradeMigrationService: { getCompletedInstanceCommandNames: jest.Mock };
}> => {
  const upgradeMigrationService = {
    getCompletedInstanceCommandNames: jest
      .fn()
      .mockResolvedValue(completedCommandNames),
  };

  const upgradeCommandRegistryService = {
    getAllRegisteredCommandNames: jest.fn().mockReturnValue(knownCommandNames),
  };

  const fakeDataSource = { entityMetadatas: [] } as unknown as DataSource;

  const moduleRef = await Test.createTestingModule({
    providers: [
      UpgradePositionRegistry,
      { provide: UpgradeMigrationService, useValue: upgradeMigrationService },
      {
        provide: UpgradeCommandRegistryService,
        useValue: upgradeCommandRegistryService,
      },
      { provide: getDataSourceToken(), useValue: fakeDataSource },
    ],
  }).compile();

  const registry = moduleRef.get(UpgradePositionRegistry);

  registry.onModuleInit();

  return { registry, upgradeMigrationService };
};

describe('UpgradePositionRegistry', () => {
  it('should seed the position with all registered commands at boot', async () => {
    const { registry } = await buildRegistry();

    const position = registry.getCurrentPosition();

    expect([...position.appliedCommandNames].sort()).toEqual(
      [...REGISTERED_CMDS].sort(),
    );
  });

  it('should narrow the position to completed commands on beginUpgradeRun', async () => {
    const { registry } = await buildRegistry({
      completedCommandNames: [REGISTERED_CMDS[0]],
    });

    await registry.beginUpgradeRun();

    expect([...registry.getCurrentPosition().appliedCommandNames]).toEqual([
      REGISTERED_CMDS[0],
    ]);
  });

  it('should grow the position via markCommandApplied only while a run is active', async () => {
    const { registry } = await buildRegistry({
      completedCommandNames: [REGISTERED_CMDS[0]],
    });

    // No-op before beginUpgradeRun (seed already includes every name).
    registry.markCommandApplied(REGISTERED_CMDS[1]);
    expect(registry.getCurrentPosition().appliedCommandNames.size).toBe(
      REGISTERED_CMDS.length,
    );

    await registry.beginUpgradeRun();
    registry.markCommandApplied(REGISTERED_CMDS[1]);

    expect([
      ...registry.getCurrentPosition().appliedCommandNames,
    ].sort()).toEqual([REGISTERED_CMDS[0], REGISTERED_CMDS[1]].sort());
  });

  it('should restore the all-applied seed on endUpgradeRun', async () => {
    const { registry } = await buildRegistry({
      completedCommandNames: [REGISTERED_CMDS[0]],
    });

    await registry.beginUpgradeRun();
    registry.endUpgradeRun();

    expect([
      ...registry.getCurrentPosition().appliedCommandNames,
    ].sort()).toEqual([...REGISTERED_CMDS].sort());
  });

  it('should notify listeners on begin/markApplied/end', async () => {
    const { registry } = await buildRegistry({
      completedCommandNames: [REGISTERED_CMDS[0]],
    });

    const listener = jest.fn();

    registry.onPositionChanged(listener);

    await registry.beginUpgradeRun();
    expect(listener).toHaveBeenCalledTimes(1);

    registry.markCommandApplied(REGISTERED_CMDS[1]);
    expect(listener).toHaveBeenCalledTimes(2);

    // Duplicate markCommandApplied should not re-notify.
    registry.markCommandApplied(REGISTERED_CMDS[1]);
    expect(listener).toHaveBeenCalledTimes(2);

    registry.endUpgradeRun();
    expect(listener).toHaveBeenCalledTimes(3);
  });
});
