import * as fs from 'fs';
import * as path from 'path';

import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { UPGRADE_COMMAND_SUPPORTED_VERSIONS } from 'src/engine/constants/upgrade-command-supported-versions.constant';
import { InstanceCommandGenerationService } from 'src/engine/core-modules/upgrade/services/instance-command-generation.service';

const UPGRADE_VERSION_COMMAND_DIR = path.resolve(
  process.cwd(),
  'src/database/commands/upgrade-version-command',
);

type GenerateVersionedMigrationCommandOptions = {
  name: string;
};

@Command({
  name: 'generate:versioned-migration',
  description:
    'Generate a TypeORM migration with @RegisteredInstanceMigration decorator for the latest supported version',
})
export class GenerateVersionedMigrationCommand extends CommandRunner {
  private readonly logger = new Logger(GenerateVersionedMigrationCommand.name);

  constructor(
    private readonly instanceMigrationGenerationService: InstanceCommandGenerationService,
  ) {
    super();
  }

  @Option({
    flags: '-n, --name <name>',
    description: 'Migration name (kebab-case)',
    defaultValue: 'auto-generated',
  })
  parseName(value: string): string {
    return value;
  }

  async run(
    _passedParams: string[],
    options: GenerateVersionedMigrationCommandOptions,
  ): Promise<void> {
    const migrationName = options.name;

    const version = UPGRADE_COMMAND_SUPPORTED_VERSIONS.slice(-1)[0];

    if (!version) {
      throw new Error('No supported versions found');
    }

    this.logger.log(`Generating versioned migration for version ${version}...`);

    const versionDir = this.getVersionDir(version);
    const timestamp = Date.now();

    const result = await this.instanceMigrationGenerationService.generate({
      migrationName,
      version,
      timestamp,
    });

    if (!result) {
      this.logger.warn(
        'No changes in database schema were found - cannot generate a migration.',
      );

      return;
    }

    const migrationFilePath = path.join(versionDir, result.fileName);

    fs.writeFileSync(migrationFilePath, result.fileTemplate);

    this.logger.log(`Migration generated successfully: ${migrationFilePath}`);
    this.logger.log(`  Class: ${result.className}`);
    this.logger.log(`  Version: ${version}`);
  }

  private getVersionDir(version: string): string {
    const versionSlug = version.split('.').slice(0, 2).join('-');

    return path.join(UPGRADE_VERSION_COMMAND_DIR, versionSlug);
  }
}
