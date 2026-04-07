import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { type MigrationInterface } from 'typeorm';

import { getRegisteredInstanceMigrationMetadata } from 'src/database/typeorm/core/decorators/registered-instance-migration.decorator';
import {
  UPGRADE_COMMAND_SUPPORTED_VERSIONS,
  type UpgradeCommandVersion,
} from 'src/engine/constants/upgrade-command-supported-versions.constant';

type TimestampedMigration = {
  migration: MigrationInterface;
  timestamp: number;
};

@Injectable()
export class RegisteredInstanceMigrationService implements OnModuleInit {
  private readonly logger = new Logger(RegisteredInstanceMigrationService.name);

  private readonly migrationsByVersion = new Map<
    UpgradeCommandVersion,
    TimestampedMigration[]
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

      const metadata = getRegisteredInstanceMigrationMetadata(metatype);

      if (metadata === undefined) {
        continue;
      }

      const bucket = this.migrationsByVersion.get(metadata.version);

      if (!bucket) {
        continue;
      }

      bucket.push({
        migration: instance as MigrationInterface,
        timestamp: metadata.timestamp,
      });
    }

    for (const [, bucket] of this.migrationsByVersion) {
      bucket.sort((entryA, entryB) => entryA.timestamp - entryB.timestamp);
    }

    for (const [version, bucket] of this.migrationsByVersion) {
      if (bucket.length > 0) {
        this.logger.log(
          `Registered ${bucket.length} versioned migration(s) for ${version}: ${bucket.map((entry) => entry.migration.constructor.name).join(', ')}`,
        );
      }
    }
  }

  getInstanceCommandsForVersion(
    version: UpgradeCommandVersion,
  ): MigrationInterface[] {
    return (this.migrationsByVersion.get(version) ?? []).map(
      (entry) => entry.migration,
    );
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
      const bucket = this.migrationsByVersion.get(version) ?? [];

      for (const entry of bucket) {
        result.push({ version, migration: entry.migration });
      }
    }

    return result;
  }
}
