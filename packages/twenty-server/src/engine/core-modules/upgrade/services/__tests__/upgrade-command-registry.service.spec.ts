import 'reflect-metadata';

import { Test } from '@nestjs/testing';
import { DiscoveryService } from '@nestjs/core';

import { type MigrationInterface } from 'typeorm';

import { UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';

@RegisteredInstanceCommand('1.21.0', 1770000000000)
class MigrationA1770000000000 implements MigrationInterface {
  name = 'MigrationA1770000000000';

  async up(): Promise<void> {}
  async down(): Promise<void> {}
}

@RegisteredInstanceCommand('1.21.0', 1771000000000)
class MigrationB1771000000000 implements MigrationInterface {
  name = 'MigrationB1771000000000';

  async up(): Promise<void> {}
  async down(): Promise<void> {}
}

@RegisteredInstanceCommand('1.21.0', 1772000000000)
class MigrationC1772000000000 implements MigrationInterface {
  name = 'MigrationC1772000000000';

  async up(): Promise<void> {}
  async down(): Promise<void> {}
}

@RegisteredInstanceCommand('1.20.0', 1769000000000)
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

@RegisteredWorkspaceCommand('1.21.0', 1773000000000)
class WorkspaceCommandA {
  async runOnWorkspace(): Promise<void> {}
}

@RegisteredWorkspaceCommand('1.21.0', 1774000000000)
class WorkspaceCommandB {
  async runOnWorkspace(): Promise<void> {}
}

const buildProviderWrapper = (instance: object) => ({
  instance,
  metatype: instance.constructor,
});

const buildRegistryService = async (
  instances: object[],
): Promise<UpgradeCommandRegistryService> => {
  const module = await Test.createTestingModule({
    providers: [
      UpgradeCommandRegistryService,
      {
        provide: DiscoveryService,
        useValue: {
          getProviders: () => instances.map(buildProviderWrapper),
        },
      },
    ],
  }).compile();

  const service = module.get(UpgradeCommandRegistryService);

  service.onModuleInit();

  return service;
};

describe('UpgradeCommandRegistryService', () => {
  it('should group instance migrations by version', async () => {
    const service = await buildRegistryService([
      new MigrationD1769000000000(),
      new MigrationA1770000000000(),
      new MigrationB1771000000000(),
      new MigrationC1772000000000(),
    ]);

    const v120 = service.getInstanceCommandsForVersion('1.20.0');
    const v121 = service.getInstanceCommandsForVersion('1.21.0');

    expect(v120.map((migration) => migration.constructor.name)).toStrictEqual([
      'MigrationD1769000000000',
    ]);

    expect(v121.map((migration) => migration.constructor.name)).toStrictEqual([
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
      .map((migration) => migration.constructor.name);

    expect(names).toStrictEqual([
      'MigrationA1770000000000',
      'MigrationB1771000000000',
      'MigrationC1772000000000',
    ]);
  });

  it('should skip undecorated providers', async () => {
    const service = await buildRegistryService([
      new UndecoratedMigration1768000000000(),
      new MigrationA1770000000000(),
    ]);

    const v121 = service.getInstanceCommandsForVersion('1.21.0');

    expect(v121).toHaveLength(1);
    expect(v121[0].constructor.name).toBe('MigrationA1770000000000');
  });

  it('should return empty array for version with no commands', async () => {
    const service = await buildRegistryService([]);

    expect(service.getInstanceCommandsForVersion('1.20.0')).toStrictEqual([]);
    expect(service.getInstanceCommandsForVersion('1.21.0')).toStrictEqual([]);
    expect(service.getWorkspaceCommandsForVersion('1.20.0')).toStrictEqual([]);
    expect(service.getWorkspaceCommandsForVersion('1.21.0')).toStrictEqual([]);
  });

  it('should return empty array for unsupported version', async () => {
    const service = await buildRegistryService([]);

    expect(
      service.getInstanceCommandsForVersion('99.0.0' as unknown as '1.21.0'),
    ).toStrictEqual([]);
  });

  it('should discover workspace commands and sort by timestamp', async () => {
    const service = await buildRegistryService([
      new WorkspaceCommandB(),
      new WorkspaceCommandA(),
    ]);

    const commands = service.getWorkspaceCommandsForVersion('1.21.0');

    expect(commands.map((command) => command.constructor.name)).toStrictEqual([
      'WorkspaceCommandA',
      'WorkspaceCommandB',
    ]);
  });

  it('should discover both instance and workspace commands for the same version', async () => {
    const service = await buildRegistryService([
      new MigrationA1770000000000(),
      new WorkspaceCommandA(),
      new MigrationB1771000000000(),
      new WorkspaceCommandB(),
    ]);

    const instanceCommands = service.getInstanceCommandsForVersion('1.21.0');
    const workspaceCommands = service.getWorkspaceCommandsForVersion('1.21.0');

    expect(instanceCommands).toHaveLength(2);
    expect(workspaceCommands).toHaveLength(2);
  });

  it('should allow same timestamp across different kinds', async () => {
    @RegisteredWorkspaceCommand('1.21.0', 1770000000000)
    class WorkspaceCommandSameTimestamp {
      async runOnWorkspace(): Promise<void> {}
    }

    const service = await buildRegistryService([
      new MigrationA1770000000000(),
      new WorkspaceCommandSameTimestamp(),
    ]);

    expect(service.getInstanceCommandsForVersion('1.21.0')).toHaveLength(1);
    expect(service.getWorkspaceCommandsForVersion('1.21.0')).toHaveLength(1);
  });

  it('should throw on duplicate timestamps within the same kind', async () => {
    @RegisteredInstanceCommand('1.21.0', 1770000000000)
    class DuplicateInstanceTimestamp implements MigrationInterface {
      name = 'DuplicateInstanceTimestamp';

      async up(): Promise<void> {}
      async down(): Promise<void> {}
    }

    await expect(
      buildRegistryService([
        new MigrationA1770000000000(),
        new DuplicateInstanceTimestamp(),
      ]),
    ).rejects.toThrow('Duplicate instance command timestamp 1770000000000');
  });

  it('should throw on duplicate computed names across kinds', async () => {
    @RegisteredWorkspaceCommand('1.21.0', 1770000000000)
    class MigrationA1770000000000_WS {
      async runOnWorkspace(): Promise<void> {}
    }

    Object.defineProperty(MigrationA1770000000000_WS, 'name', {
      value: 'MigrationA1770000000000',
    });

    await expect(
      buildRegistryService([
        new MigrationA1770000000000(),
        new MigrationA1770000000000_WS(),
      ]),
    ).rejects.toThrow(
      'Duplicate upgrade command name "1.21.0_MigrationA1770000000000_1770000000000"',
    );
  });

  it('should return all instance commands across versions sorted by timestamp', async () => {
    const service = await buildRegistryService([
      new MigrationC1772000000000(),
      new MigrationD1769000000000(),
      new MigrationA1770000000000(),
      new MigrationB1771000000000(),
    ]);

    const allCommands = service.getAllInstanceCommands();

    expect(allCommands).toStrictEqual([
      {
        version: '1.20.0',
        migration: expect.objectContaining({ name: 'MigrationD1769000000000' }),
      },
      {
        version: '1.21.0',
        migration: expect.objectContaining({ name: 'MigrationA1770000000000' }),
      },
      {
        version: '1.21.0',
        migration: expect.objectContaining({ name: 'MigrationB1771000000000' }),
      },
      {
        version: '1.21.0',
        migration: expect.objectContaining({ name: 'MigrationC1772000000000' }),
      },
    ]);
  });

  it('should return empty array from getAllInstanceCommands when no commands registered', async () => {
    const service = await buildRegistryService([]);

    expect(service.getAllInstanceCommands()).toStrictEqual([]);
  });

  it('should allow same class name with different timestamps across kinds', async () => {
    @RegisteredWorkspaceCommand('1.21.0', 1790000000000)
    class MigrationA1770000000000_WS {
      async runOnWorkspace(): Promise<void> {}
    }

    Object.defineProperty(MigrationA1770000000000_WS, 'name', {
      value: 'MigrationA1770000000000',
    });

    const service = await buildRegistryService([
      new MigrationA1770000000000(),
      new MigrationA1770000000000_WS(),
    ]);

    expect(service.getInstanceCommandsForVersion('1.21.0')).toHaveLength(1);
    expect(service.getWorkspaceCommandsForVersion('1.21.0')).toHaveLength(1);
  });
});
