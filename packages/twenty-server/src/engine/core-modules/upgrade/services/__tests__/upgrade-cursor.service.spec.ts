import 'reflect-metadata';

import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';

import { type DataSource } from 'typeorm';

import { UpgradeCursorService } from 'src/engine/core-modules/upgrade/services/upgrade-cursor.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';

const SEQUENCE_NAMES = [
  '2.5.0_FirstCommand_1700000000000',
  '2.6.0_SecondCommand_1700000000001',
  '2.6.0_ThirdCommand_1700000000002',
];

const buildService = async ({
  lastAttempted = null,
}: {
  lastAttempted?: { name: string; status: 'completed' | 'failed' } | null;
} = {}): Promise<{
  service: UpgradeCursorService;
  upgradeMigrationService: { getLastAttemptedInstanceCommand: jest.Mock };
}> => {
  const upgradeMigrationService = {
    getLastAttemptedInstanceCommand: jest
      .fn()
      .mockResolvedValue(lastAttempted),
  };

  const upgradeSequenceReaderService = {
    getUpgradeSequence: jest
      .fn()
      .mockReturnValue(SEQUENCE_NAMES.map((name) => ({ name }))),
  };

  const fakeDataSource = { entityMetadatas: [] } as unknown as DataSource;

  const moduleRef = await Test.createTestingModule({
    providers: [
      UpgradeCursorService,
      { provide: UpgradeMigrationService, useValue: upgradeMigrationService },
      {
        provide: UpgradeSequenceReaderService,
        useValue: upgradeSequenceReaderService,
      },
      { provide: getDataSourceToken(), useValue: fakeDataSource },
    ],
  }).compile();

  const service = moduleRef.get(UpgradeCursorService);

  service.onModuleInit();

  return { service, upgradeMigrationService };
};

describe('UpgradeCursorService', () => {
  it('should seed the cursor past the end at boot (all steps applied)', async () => {
    const { service } = await buildService();

    expect(service.getCurrentCursor()).toBe(SEQUENCE_NAMES.length);

    for (const name of SEQUENCE_NAMES) {
      expect(service.isStepAppliedAtCurrentCursor(name)).toBe(true);
    }
  });

  it('should set the cursor to 0 when no instance command has ever run', async () => {
    const { service } = await buildService();

    await service.beginUpgradeRun();

    expect(service.getCurrentCursor()).toBe(0);

    for (const name of SEQUENCE_NAMES) {
      expect(service.isStepAppliedAtCurrentCursor(name)).toBe(false);
    }
  });

  it('should set the cursor past the last completed step', async () => {
    const { service } = await buildService({
      lastAttempted: { name: SEQUENCE_NAMES[0], status: 'completed' },
    });

    await service.beginUpgradeRun();

    expect(service.getCurrentCursor()).toBe(1);
    expect(service.isStepAppliedAtCurrentCursor(SEQUENCE_NAMES[0])).toBe(true);
    expect(service.isStepAppliedAtCurrentCursor(SEQUENCE_NAMES[1])).toBe(false);
  });

  it('should set the cursor on the failed step itself so it gets retried', async () => {
    const { service } = await buildService({
      lastAttempted: { name: SEQUENCE_NAMES[1], status: 'failed' },
    });

    await service.beginUpgradeRun();

    expect(service.getCurrentCursor()).toBe(1);
    expect(service.isStepAppliedAtCurrentCursor(SEQUENCE_NAMES[0])).toBe(true);
    expect(service.isStepAppliedAtCurrentCursor(SEQUENCE_NAMES[1])).toBe(false);
  });

  it('should advance the cursor via advanceCursorTo only while a run is active', async () => {
    const { service } = await buildService();

    service.advanceCursorTo(SEQUENCE_NAMES[1]);
    expect(service.getCurrentCursor()).toBe(SEQUENCE_NAMES.length);

    await service.beginUpgradeRun();
    service.advanceCursorTo(SEQUENCE_NAMES[1]);

    expect(service.getCurrentCursor()).toBe(2);
  });

  it('should restore the past-the-end cursor on endUpgradeRun', async () => {
    const { service } = await buildService({
      lastAttempted: { name: SEQUENCE_NAMES[0], status: 'completed' },
    });

    await service.beginUpgradeRun();
    service.endUpgradeRun();

    expect(service.getCurrentCursor()).toBe(SEQUENCE_NAMES.length);
  });

  it('should notify listeners on begin / advance / end', async () => {
    const { service } = await buildService();

    const listener = jest.fn();

    service.onCursorChanged(listener);

    await service.beginUpgradeRun();
    expect(listener).toHaveBeenCalledTimes(1);

    service.advanceCursorTo(SEQUENCE_NAMES[1]);
    expect(listener).toHaveBeenCalledTimes(2);

    service.advanceCursorTo(SEQUENCE_NAMES[1]);
    expect(listener).toHaveBeenCalledTimes(2);

    service.endUpgradeRun();
    expect(listener).toHaveBeenCalledTimes(3);
  });
});
