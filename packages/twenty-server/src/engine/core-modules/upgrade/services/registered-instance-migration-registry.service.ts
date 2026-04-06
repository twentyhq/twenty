import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource, type MigrationInterface } from 'typeorm';

import { getRegisteredInstanceMigration } from 'src/database/typeorm/core/decorators/registered-instance-migration.decorator';
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

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  onModuleInit(): void {
    for (const version of UPGRADE_COMMAND_SUPPORTED_VERSIONS) {
      this.migrationsByVersion.set(version, []);
    }

    for (const migration of this.dataSource.migrations) {
      const constructor = migration.constructor;
      const version = getRegisteredInstanceMigration(constructor);

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
