import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { type MigrationInterface, DataSource } from 'typeorm';

import { getVersionedMigrationVersion } from 'src/database/typeorm/core/decorators/versioned-migration.decorator';
import {
  UPGRADE_COMMAND_SUPPORTED_VERSIONS,
  type UpgradeCommandVersion,
} from 'src/engine/constants/upgrade-command-supported-versions.constant';

@Injectable()
export class VersionedMigrationRegistryService implements OnModuleInit {
  private readonly logger = new Logger(VersionedMigrationRegistryService.name);

  private readonly migrationsByVersion = new Map<
    UpgradeCommandVersion,
    MigrationInterface[]
  >();

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  onModuleInit(): void {
    for (const version of UPGRADE_COMMAND_SUPPORTED_VERSIONS) {
      this.migrationsByVersion.set(version, []);
    }

    // dataSource.migrations is already sorted by timestamp (TypeORM sorts
    // ascending by the 13-digit suffix of the class name)
    for (const migration of this.dataSource.migrations) {
      const constructor = migration.constructor;
      const version = getVersionedMigrationVersion(constructor);

      if (version === undefined) {
        continue;
      }

      const bucket = this.migrationsByVersion.get(version);

      if (!bucket) {
        continue;
      }

      bucket.push(migration);
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
}
