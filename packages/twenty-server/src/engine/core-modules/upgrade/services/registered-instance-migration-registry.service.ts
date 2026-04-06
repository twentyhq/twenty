import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { type MigrationInterface } from 'typeorm';

import { getRegisteredInstanceMigrationVersion } from 'src/database/typeorm/core/decorators/registered-instance-migration.decorator';
import {
  UPGRADE_COMMAND_SUPPORTED_VERSIONS,
  type UpgradeCommandVersion,
} from 'src/engine/constants/upgrade-command-supported-versions.constant';

@Injectable()
export class RegisteredInstanceMigrationService implements OnModuleInit {
  private readonly logger = new Logger(RegisteredInstanceMigrationService.name);

  private readonly migrationsByVersion = new Map<
    UpgradeCommandVersion,
    MigrationInterface[]
  >();

  constructor(private readonly discoveryService: DiscoveryService) {}

  onModuleInit(): void {
    for (const version of UPGRADE_COMMAND_SUPPORTED_VERSIONS) {
      this.migrationsByVersion.set(version, []);
    }

    const providers = this.discoveryService.getProviders();

    for (const wrapper of providers) {
      const { instance, metatype } = wrapper;

      if (!instance || !metatype) {
        continue;
      }

      const version = getRegisteredInstanceMigrationVersion(metatype);

      if (version === undefined) {
        continue;
      }

      const bucket = this.migrationsByVersion.get(version);

      if (!bucket) {
        continue;
      }

      bucket.push(instance as MigrationInterface);
    }

    for (const [version, migrations] of this.migrationsByVersion) {
      if (migrations.length > 0) {
        this.logger.log(
          `Registered ${migrations.length} versioned migration(s) for ${version}: ${migrations.map((migration) => migration.constructor.name).join(', ')}`,
        );
      }
    }
  }

  getInstanceCommandsForVersion(
    version: UpgradeCommandVersion,
  ): MigrationInterface[] {
    return this.migrationsByVersion.get(version) ?? [];
  }

  getAllInstanceCommands(): {
    version: UpgradeCommandVersion;
    migration: MigrationInterface;
  }[] {
    const result: {
      version: UpgradeCommandVersion;
      migration: MigrationInterface;
    }[] = [];

    for (const version of UPGRADE_COMMAND_SUPPORTED_VERSIONS) {
      const migrations = this.migrationsByVersion.get(version) ?? [];

      for (const migration of migrations) {
        result.push({ version, migration });
      }
    }

    return result;
  }
}
