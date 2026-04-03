import * as fs from 'fs';
import * as path from 'path';

import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { CoreMigrationGeneratorService } from 'src/database/commands/core-migration/services/core-migration-generator.service';
import { UPGRADE_COMMAND_SUPPORTED_VERSIONS } from 'src/engine/constants/upgrade-command-supported-versions.constant';

const MIGRATIONS_DIR = path.resolve(
  process.cwd(),
  'src/database/typeorm/core/migrations/common',
);

type GenerateVersionedMigrationCommandOptions = {
  name: string;
};

@Command({
  name: 'generate:versioned-migration',
  description:
    'Generate a TypeORM migration with @RegisteredCoreMigration decorator for the latest supported version',
})
export class GenerateVersionedMigrationCommand extends CommandRunner {
  private readonly logger = new Logger(GenerateVersionedMigrationCommand.name);

  constructor(
    private readonly coreMigrationGeneratorService: CoreMigrationGeneratorService,
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

    const timestamp = Date.now();

    const result = await this.coreMigrationGeneratorService.generate({
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

    const filePath = path.join(MIGRATIONS_DIR, result.fileName);

    fs.writeFileSync(filePath, result.fileTemplate);

    this.logger.log(`Migration generated successfully: ${filePath}`);
    this.logger.log(`  Class: ${result.className}`);
    this.logger.log(`  Version: ${version}`);
  }
}
