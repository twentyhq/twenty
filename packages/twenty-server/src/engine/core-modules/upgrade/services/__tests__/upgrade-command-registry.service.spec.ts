import 'reflect-metadata';

import { Test } from '@nestjs/testing';
import { DiscoveryService } from '@nestjs/core';

import { type DataSource } from 'typeorm';

import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

import { UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { TWENTY_CURRENT_VERSION } from 'src/engine/core-modules/upgrade/constants/twenty-current-version.constant';
import { TWENTY_PREVIOUS_VERSIONS } from 'src/engine/core-modules/upgrade/constants/twenty-previous-versions.constant';

const VERSION_A = TWENTY_CURRENT_VERSION;
const VERSION_B = TWENTY_PREVIOUS_VERSIONS[0];

@RegisteredInstanceCommand(VERSION_A, 1770000000000)
class MigrationA1770000000000 implements FastInstanceCommand {
  name = 'MigrationA1770000000000';

  async up(): Promise<void> {}
  async down(): Promise<void> {}
}

@RegisteredInstanceCommand(VERSION_A, 1771000000000)
class MigrationB1771000000000 implements FastInstanceCommand {
  name = 'MigrationB1771000000000';

  async up(): Promise<void> {}
  async down(): Promise<void> {}
}

@RegisteredInstanceCommand(VERSION_A, 1772000000000)
class MigrationC1772000000000 implements FastInstanceCommand {
  name = 'MigrationC1772000000000';

  async up(): Promise<void> {}
  async down(): Promise<void> {}
}

@RegisteredInstanceCommand(VERSION_B, 1769000000000)
class MigrationD1769000000000 implements FastInstanceCommand {
  name = 'MigrationD1769000000000';

  async up(): Promise<void> {}
  async down(): Promise<void> {}
}

class UndecoratedMigration1768000000000 implements FastInstanceCommand {
  name = 'UndecoratedMigration1768000000000';

  async up(): Promise<void> {}
  async down(): Promise<void> {}
}

@RegisteredWorkspaceCommand(VERSION_A, 1773000000000)
class WorkspaceCommandA {
  async runOnWorkspace(): Promise<void> {}
}

@RegisteredWorkspaceCommand(VERSION_A, 1774000000000)
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
      new WorkspaceCommandA(),
    ]);

    const bundleB = service.getBundleForVersion(VERSION_B);
    const bundleA = service.getBundleForVersion(VERSION_A);

    expect(
      bundleB.fastInstanceCommands.map(
        (entry) => entry.command.constructor.name,
      ),
    ).toStrictEqual(['MigrationD1769000000000']);

    expect(
      bundleA.fastInstanceCommands.map(
        (entry) => entry.command.constructor.name,
      ),
    ).toStrictEqual([
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
      new WorkspaceCommandA(),
    ]);

    const names = service
      .getBundleForVersion(VERSION_A)
      .fastInstanceCommands.map((entry) => entry.command.constructor.name);

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
      new WorkspaceCommandA(),
    ]);

    const bundleA = service.getBundleForVersion(VERSION_A);

    expect(bundleA.fastInstanceCommands).toHaveLength(1);
    expect(bundleA.fastInstanceCommands[0].command.constructor.name).toBe(
      'MigrationA1770000000000',
    );
  });

  it('should throw when no workspace commands are discovered', async () => {
    await expect(buildRegistryService([])).rejects.toThrow(
      'Upgrade sequence must contain at least one workspace command',
    );
  });

  it('should return empty array for unsupported version', async () => {
    const service = await buildRegistryService([new WorkspaceCommandA()]);

    expect(
      service.getBundleForVersion('99.0.0' as typeof VERSION_A)
        .fastInstanceCommands,
    ).toStrictEqual([]);
  });

  it('should discover workspace commands and sort by timestamp', async () => {
    const service = await buildRegistryService([
      new WorkspaceCommandB(),
      new WorkspaceCommandA(),
    ]);

    const { workspaceCommands } = service.getBundleForVersion(VERSION_A);

    expect(
      workspaceCommands.map((entry) => entry.command.constructor.name),
    ).toStrictEqual(['WorkspaceCommandA', 'WorkspaceCommandB']);
  });

  it('should discover both instance and workspace commands for the same version', async () => {
    const service = await buildRegistryService([
      new MigrationA1770000000000(),
      new WorkspaceCommandA(),
      new MigrationB1771000000000(),
      new WorkspaceCommandB(),
    ]);

    const bucket = service.getBundleForVersion(VERSION_A);

    expect(bucket.fastInstanceCommands).toHaveLength(2);
    expect(bucket.workspaceCommands).toHaveLength(2);
  });

  it('should allow same timestamp across different kinds', async () => {
    @RegisteredWorkspaceCommand(VERSION_A, 1770000000000)
    class WorkspaceCommandSameTimestamp {
      async runOnWorkspace(): Promise<void> {}
    }

    const service = await buildRegistryService([
      new MigrationA1770000000000(),
      new WorkspaceCommandSameTimestamp(),
    ]);

    const bucket = service.getBundleForVersion(VERSION_A);

    expect(bucket.fastInstanceCommands).toHaveLength(1);
    expect(bucket.workspaceCommands).toHaveLength(1);
  });

  it('should throw on duplicate timestamps within the same kind', async () => {
    @RegisteredInstanceCommand(VERSION_A, 1770000000000)
    class DuplicateInstanceTimestamp implements FastInstanceCommand {
      name = 'DuplicateInstanceTimestamp';

      async up(): Promise<void> {}
      async down(): Promise<void> {}
    }

    await expect(
      buildRegistryService([
        new MigrationA1770000000000(),
        new DuplicateInstanceTimestamp(),
      ]),
    ).rejects.toThrow(
      'Duplicate fast-instance command timestamp 1770000000000',
    );
  });

  it('should throw on duplicate computed names across kinds', async () => {
    @RegisteredWorkspaceCommand(VERSION_A, 1770000000000)
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
      `Duplicate upgrade command name "${VERSION_A}_MigrationA1770000000000_1770000000000"`,
    );
  });

  it('should return all instance commands across versions sorted by timestamp', async () => {
    const service = await buildRegistryService([
      new MigrationC1772000000000(),
      new MigrationD1769000000000(),
      new MigrationA1770000000000(),
      new MigrationB1771000000000(),
      new WorkspaceCommandA(),
    ]);

    const allCommands = service.getCrossUpgradeSupportedFastInstanceCommands();

    expect(allCommands.map((entry) => entry.name)).toStrictEqual([
      `${VERSION_B}_MigrationD1769000000000_1769000000000`,
      `${VERSION_A}_MigrationA1770000000000_1770000000000`,
      `${VERSION_A}_MigrationB1771000000000_1771000000000`,
      `${VERSION_A}_MigrationC1772000000000_1772000000000`,
    ]);
  });

  it('should return empty array from getCrossUpgradeSupportedFastInstanceCommands when no instance commands registered', async () => {
    const service = await buildRegistryService([new WorkspaceCommandA()]);

    expect(
      service.getCrossUpgradeSupportedFastInstanceCommands(),
    ).toStrictEqual([]);
  });

  it('should allow same class name with different timestamps across kinds', async () => {
    @RegisteredWorkspaceCommand(VERSION_A, 1790000000000)
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

    const bucket = service.getBundleForVersion(VERSION_A);

    expect(bucket.fastInstanceCommands).toHaveLength(1);
    expect(bucket.workspaceCommands).toHaveLength(1);
  });

  it('should discover slow instance commands and sort by timestamp', async () => {
    @RegisteredInstanceCommand(VERSION_A, 1780000000000, { type: 'slow' })
    class SlowMigrationB1780000000000 implements SlowInstanceCommand {
      name = 'SlowMigrationB1780000000000';

      async runDataMigration(_dataSource: DataSource): Promise<void> {}
      async up(): Promise<void> {}
      async down(): Promise<void> {}
    }

    @RegisteredInstanceCommand(VERSION_A, 1779000000000, { type: 'slow' })
    class SlowMigrationA1779000000000 implements SlowInstanceCommand {
      name = 'SlowMigrationA1779000000000';

      async runDataMigration(_dataSource: DataSource): Promise<void> {}
      async up(): Promise<void> {}
      async down(): Promise<void> {}
    }

    const service = await buildRegistryService([
      new SlowMigrationB1780000000000(),
      new SlowMigrationA1779000000000(),
      new WorkspaceCommandA(),
    ]);

    const { slowInstanceCommands } = service.getBundleForVersion(VERSION_A);

    expect(
      slowInstanceCommands.map((entry) => entry.command.constructor.name),
    ).toStrictEqual([
      'SlowMigrationA1779000000000',
      'SlowMigrationB1780000000000',
    ]);
  });

  it('should separate fast and slow instance commands in the same version', async () => {
    @RegisteredInstanceCommand(VERSION_A, 1780000000000, { type: 'slow' })
    class SlowMigration1780000000000 implements SlowInstanceCommand {
      name = 'SlowMigration1780000000000';

      async runDataMigration(_dataSource: DataSource): Promise<void> {}
      async up(): Promise<void> {}
      async down(): Promise<void> {}
    }

    const service = await buildRegistryService([
      new MigrationA1770000000000(),
      new SlowMigration1780000000000(),
      new WorkspaceCommandA(),
    ]);

    const bucket = service.getBundleForVersion(VERSION_A);

    expect(bucket.fastInstanceCommands).toHaveLength(1);
    expect(bucket.slowInstanceCommands).toHaveLength(1);
  });

  it('should throw on duplicate timestamps within slow instance commands', async () => {
    @RegisteredInstanceCommand(VERSION_A, 1780000000000, { type: 'slow' })
    class SlowMigrationA1780000000000 implements SlowInstanceCommand {
      name = 'SlowMigrationA1780000000000';

      async runDataMigration(_dataSource: DataSource): Promise<void> {}
      async up(): Promise<void> {}
      async down(): Promise<void> {}
    }

    @RegisteredInstanceCommand(VERSION_A, 1780000000000, { type: 'slow' })
    class SlowMigrationB1780000000000 implements SlowInstanceCommand {
      name = 'SlowMigrationB1780000000000';

      async runDataMigration(_dataSource: DataSource): Promise<void> {}
      async up(): Promise<void> {}
      async down(): Promise<void> {}
    }

    await expect(
      buildRegistryService([
        new SlowMigrationA1780000000000(),
        new SlowMigrationB1780000000000(),
      ]),
    ).rejects.toThrow(
      'Duplicate slow-instance command timestamp 1780000000000',
    );
  });

  it('should allow same timestamp across fast and slow instance commands', async () => {
    @RegisteredInstanceCommand(VERSION_A, 1770000000000, { type: 'slow' })
    class SlowMigrationSameTimestamp implements SlowInstanceCommand {
      name = 'SlowMigrationSameTimestamp';

      async runDataMigration(_dataSource: DataSource): Promise<void> {}
      async up(): Promise<void> {}
      async down(): Promise<void> {}
    }

    const service = await buildRegistryService([
      new MigrationA1770000000000(),
      new SlowMigrationSameTimestamp(),
      new WorkspaceCommandA(),
    ]);

    const bucket = service.getBundleForVersion(VERSION_A);

    expect(bucket.fastInstanceCommands).toHaveLength(1);
    expect(bucket.slowInstanceCommands).toHaveLength(1);
  });

  it('should return all slow instance commands across versions', async () => {
    @RegisteredInstanceCommand(VERSION_A, 1780000000000, { type: 'slow' })
    class SlowMigration1780000000000 implements SlowInstanceCommand {
      name = 'SlowMigration1780000000000';

      async runDataMigration(_dataSource: DataSource): Promise<void> {}
      async up(): Promise<void> {}
      async down(): Promise<void> {}
    }

    @RegisteredInstanceCommand(VERSION_B, 1768000000000, { type: 'slow' })
    class SlowMigration1768000000000 implements SlowInstanceCommand {
      name = 'SlowMigration1768000000000';

      async runDataMigration(_dataSource: DataSource): Promise<void> {}
      async up(): Promise<void> {}
      async down(): Promise<void> {}
    }

    const service = await buildRegistryService([
      new SlowMigration1780000000000(),
      new SlowMigration1768000000000(),
      new WorkspaceCommandA(),
    ]);

    const allSlowCommands =
      service.getCrossUpgradeSupportedSlowInstanceCommands();

    expect(allSlowCommands.map((entry) => entry.name)).toStrictEqual([
      `${VERSION_B}_SlowMigration1768000000000_1768000000000`,
      `${VERSION_A}_SlowMigration1780000000000_1780000000000`,
    ]);
  });
});
