import 'reflect-metadata';

import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';

import { type MigrationInterface } from 'typeorm';

import { RegisteredCoreMigrationService } from 'src/database/commands/core-migration/services/registered-core-migration-registry.service';
import { RegisteredCoreMigration } from 'src/database/typeorm/core/decorators/registered-core-migration.decorator';

@RegisteredCoreMigration('1.21.0')
class MigrationA1770000000000 implements MigrationInterface {
  name = 'MigrationA1770000000000';

  async up(): Promise<void> {}
  async down(): Promise<void> {}
}

@RegisteredCoreMigration('1.21.0')
class MigrationB1771000000000 implements MigrationInterface {
  name = 'MigrationB1771000000000';

  async up(): Promise<void> {}
  async down(): Promise<void> {}
}

@RegisteredCoreMigration('1.21.0')
class MigrationC1772000000000 implements MigrationInterface {
  name = 'MigrationC1772000000000';

  async up(): Promise<void> {}
  async down(): Promise<void> {}
}

@RegisteredCoreMigration('1.20.0')
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

const buildRegistryService = async (
  migrations: MigrationInterface[],
): Promise<RegisteredCoreMigrationService> => {
  const module = await Test.createTestingModule({
    providers: [
      RegisteredCoreMigrationService,
      {
        provide: getDataSourceToken(),
        useValue: { migrations },
      },
    ],
  }).compile();

  const service = module.get(RegisteredCoreMigrationService);

  service.onModuleInit();

  return service;
};

describe('VersionedMigrationRegistryService', () => {
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

  it('should preserve input order within a version bucket', async () => {
    const service = await buildRegistryService([
      new MigrationA1770000000000(),
      new MigrationC1772000000000(),
      new MigrationB1771000000000(),
    ]);

    const names = service
      .getInstanceCommandsForVersion('1.21.0')
      .map((m) => m.constructor.name);

    expect(names).toStrictEqual([
      'MigrationA1770000000000',
      'MigrationC1772000000000',
      'MigrationB1771000000000',
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
