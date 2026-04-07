import 'reflect-metadata';

import { Test } from '@nestjs/testing';
import { DiscoveryService } from '@nestjs/core';

import { type MigrationInterface } from 'typeorm';

import { RegisteredInstanceMigrationService } from 'src/engine/core-modules/upgrade/services/registered-instance-migration-registry.service';
import { RegisteredInstanceMigration } from 'src/database/typeorm/core/decorators/registered-instance-migration.decorator';

@RegisteredInstanceMigration('1.21.0', 1770000000000)
class MigrationA1770000000000 implements MigrationInterface {
  name = 'MigrationA1770000000000';

  async up(): Promise<void> {}
  async down(): Promise<void> {}
}

@RegisteredInstanceMigration('1.21.0', 1771000000000)
class MigrationB1771000000000 implements MigrationInterface {
  name = 'MigrationB1771000000000';

  async up(): Promise<void> {}
  async down(): Promise<void> {}
}

@RegisteredInstanceMigration('1.21.0', 1772000000000)
class MigrationC1772000000000 implements MigrationInterface {
  name = 'MigrationC1772000000000';

  async up(): Promise<void> {}
  async down(): Promise<void> {}
}

@RegisteredInstanceMigration('1.20.0', 1769000000000)
class MigrationD1769000000000 implements MigrationInterface {
  name = 'MigrationD1769000000000';

  async up(): Promise<void> {}
  async down(): Promise<void> {}
}

class UndecoratedMigration1768000000000 implements MigrationInterface {
  name = 'UndecoratedMigration1768000000000';

  async up(): Promise<void> {}
  async down(): Promise<void> {}
}

const buildProviderWrapper = (migration: MigrationInterface) => ({
  instance: migration,
  metatype: migration.constructor,
});

const buildRegistryService = async (
  migrations: MigrationInterface[],
): Promise<RegisteredInstanceMigrationService> => {
  const module = await Test.createTestingModule({
    providers: [
      RegisteredInstanceMigrationService,
      {
        provide: DiscoveryService,
        useValue: {
          getProviders: () => migrations.map(buildProviderWrapper),
        },
      },
    ],
  }).compile();

  const service = module.get(RegisteredInstanceMigrationService);

  service.onModuleInit();

  return service;
};

describe('RegisteredInstanceMigrationService', () => {
  it('should group migrations by version', async () => {
    const service = await buildRegistryService([
      new MigrationD1769000000000(),
      new MigrationA1770000000000(),
      new MigrationB1771000000000(),
      new MigrationC1772000000000(),
    ]);

    const v120 = service.getInstanceCommandsForVersion('1.20.0');
    const v121 = service.getInstanceCommandsForVersion('1.21.0');

    expect(v120.map((m) => m.constructor.name)).toStrictEqual([
      'MigrationD1769000000000',
    ]);

    expect(v121.map((m) => m.constructor.name)).toStrictEqual([
      'MigrationA1770000000000',
      'MigrationB1771000000000',
      'MigrationC1772000000000',
    ]);
  });

  it('should sort migrations by timestamp within a version bucket', async () => {
    const service = await buildRegistryService([
      new MigrationC1772000000000(),
      new MigrationA1770000000000(),
      new MigrationB1771000000000(),
    ]);

    const names = service
      .getInstanceCommandsForVersion('1.21.0')
      .map((m) => m.constructor.name);

    expect(names).toStrictEqual([
      'MigrationA1770000000000',
      'MigrationB1771000000000',
      'MigrationC1772000000000',
    ]);
  });

  it('should skip undecorated migrations', async () => {
    const service = await buildRegistryService([
      new UndecoratedMigration1768000000000(),
      new MigrationA1770000000000(),
    ]);

    const v121 = service.getInstanceCommandsForVersion('1.21.0');

    expect(v121).toHaveLength(1);
    expect(v121[0].constructor.name).toBe('MigrationA1770000000000');
  });

  it('should return empty array for version with no migrations', async () => {
    const service = await buildRegistryService([]);

    expect(service.getInstanceCommandsForVersion('1.19.0')).toStrictEqual([]);
    expect(service.getInstanceCommandsForVersion('1.20.0')).toStrictEqual([]);
    expect(service.getInstanceCommandsForVersion('1.21.0')).toStrictEqual([]);
  });

  it('should return empty array for unsupported version', async () => {
    const service = await buildRegistryService([]);

    expect(
      service.getInstanceCommandsForVersion('99.0.0' as unknown as '1.21.0'),
    ).toStrictEqual([]);
  });
});
