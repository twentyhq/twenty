import * as fs from 'fs';
import * as path from 'path';

import { Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { Command, CommandRunner } from 'nest-commander';
import { DataSource } from 'typeorm';

import { UPGRADE_COMMAND_SUPPORTED_VERSIONS } from 'src/engine/constants/upgrade-command-supported-versions.constant';

const MIGRATIONS_DIR = path.resolve(
  process.cwd(),
  'src/database/typeorm/core/migrations/common',
);

const toPascalCase = (str: string): string =>
  str.replace(/^([A-Z])|[\s-_](\w)/g, (_match, p1, p2) =>
    p2 ? p2.toUpperCase() : p1.toLowerCase(),
  );

const versionToFileTag = (version: string): string =>
  version.replace(/\./g, '-');

const versionToClassTag = (version: string): string =>
  version.replace(/\./g, '');

const buildClassName = (
  name: string,
  version: string,
  timestamp: number,
): string =>
  `${toPascalCase(` ${name}`).trim()}V${versionToClassTag(version)}${timestamp}`;

const formatQueryParams = (parameters: unknown[] | undefined): string => {
  if (!parameters || !parameters.length) {
    return '';
  }

  return `, ${JSON.stringify(parameters)}`;
};

const escapeForSingleQuotedString = (query: string): string =>
  query.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

const buildMigrationFileContent = (
  className: string,
  version: string,
  upStatements: string[],
  downStatements: string[],
): string =>
  `import { MigrationInterface, QueryRunner } from 'typeorm';

import { VersionedMigration } from 'src/database/typeorm/core/decorators/versioned-migration.decorator';

@VersionedMigration('${version}')
export class ${className} implements MigrationInterface {
  name = '${className}';

  public async up(queryRunner: QueryRunner): Promise<void> {
${upStatements.join('\n')}
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
${downStatements.join('\n')}
  }
}
`;

@Command({
  name: 'generate:versioned-migration',
  description:
    'Generate a TypeORM migration with @VersionedMigration decorator for the latest supported version',
})
export class GenerateVersionedMigrationCommand extends CommandRunner {
  private readonly logger = new Logger(GenerateVersionedMigrationCommand.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const migrationName = passedParams[0] ?? 'auto-generated';

    const version = UPGRADE_COMMAND_SUPPORTED_VERSIONS.slice(-1)[0];

    if (!version) {
      throw new Error('No supported versions found');
    }

    this.logger.log(`Generating versioned migration for version ${version}...`);

    const sqlInMemory = await this.dataSource.driver
      .createSchemaBuilder()
      .log();

    if (sqlInMemory.upQueries.length === 0) {
      this.logger.warn(
        'No changes in database schema were found - cannot generate a migration.',
      );

      return;
    }

    const timestamp = Date.now();
    const className = buildClassName(migrationName, version, timestamp);

    const upStatements = sqlInMemory.upQueries.map(
      (query) =>
        `    await queryRunner.query('${escapeForSingleQuotedString(query.query)}'${formatQueryParams(query.parameters)});`,
    );

    const downStatements = sqlInMemory.downQueries
      .reverse()
      .map(
        (query) =>
          `    await queryRunner.query('${escapeForSingleQuotedString(query.query)}'${formatQueryParams(query.parameters)});`,
      );

    const fileContent = buildMigrationFileContent(
      className,
      version,
      upStatements,
      downStatements,
    );

    const fileName = `${timestamp}-${versionToFileTag(version)}-${migrationName}.ts`;
    const filePath = path.join(MIGRATIONS_DIR, fileName);

    fs.writeFileSync(filePath, fileContent);

    this.logger.log(`Migration generated successfully: ${filePath}`);
    this.logger.log(`  Class: ${className}`);
    this.logger.log(`  Version: ${version}`);
  }
}
