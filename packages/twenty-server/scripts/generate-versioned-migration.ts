import * as fs from 'fs';
import * as path from 'path';

import { connectionSource } from 'src/database/typeorm/core/core.datasource';

const SUPPORTED_VERSIONS_FILE = path.resolve(
  __dirname,
  '../src/engine/constants/upgrade-command-supported-versions.constant.ts',
);

const MIGRATIONS_DIR = path.resolve(
  __dirname,
  '../src/database/typeorm/core/migrations/common',
);

const toPascalCase = (str: string): string =>
  str.replace(/^([A-Z])|[\s-_](\w)/g, (_match, p1, p2) =>
    p2 ? p2.toUpperCase() : p1.toLowerCase(),
  );

const buildClassName = (name: string, timestamp: number): string =>
  // Uppercase first letter to get PascalCase
  `${toPascalCase(` ${name}`).trim()}${timestamp}`;

const formatQueryParams = (parameters: unknown[] | undefined): string => {
  if (!parameters || !parameters.length) {
    return '';
  }

  return `, ${JSON.stringify(parameters)}`;
};

const resolveLatestVersion = (): string => {
  const content = fs.readFileSync(SUPPORTED_VERSIONS_FILE, 'utf-8');
  const matches = content.match(/'(\d+\.\d+\.\d+)'/g);

  if (!matches || matches.length === 0) {
    throw new Error(
      `Could not parse versions from ${SUPPORTED_VERSIONS_FILE}`,
    );
  }

  const latestVersion = matches[matches.length - 1].replace(/'/g, '');

  return latestVersion;
};

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

const main = async (): Promise<void> => {
  const migrationName = process.argv[2];

  if (!migrationName) {
    console.error(
      'Usage: ts-node scripts/generate-versioned-migration.ts <migration-name>',
    );
    console.error('Example: ts-node scripts/generate-versioned-migration.ts add-foo-column');
    process.exit(1);
  }

  const version = resolveLatestVersion();

  console.log(`Generating versioned migration for version ${version}...`);

  connectionSource.setOptions({
    synchronize: false,
    migrationsRun: false,
    dropSchema: false,
    logging: false,
  });

  await connectionSource.initialize();

  try {
    const sqlInMemory = await connectionSource.driver
      .createSchemaBuilder()
      .log();

    if (sqlInMemory.upQueries.length === 0) {
      console.log(
        'No changes in database schema were found - cannot generate a migration.',
      );
      process.exit(1);
    }

    const timestamp = Date.now();
    const className = buildClassName(migrationName, timestamp);

    const upStatements = sqlInMemory.upQueries.map(
      (query) =>
        `    await queryRunner.query(\`${query.query.replace(/`/g, '\\`')}\`${formatQueryParams(query.parameters)});`,
    );

    const downStatements = sqlInMemory.downQueries
      .reverse()
      .map(
        (query) =>
          `    await queryRunner.query(\`${query.query.replace(/`/g, '\\`')}\`${formatQueryParams(query.parameters)});`,
      );

    const fileContent = buildMigrationFileContent(
      className,
      version,
      upStatements,
      downStatements,
    );

    const fileName = `${timestamp}-${migrationName}.ts`;
    const filePath = path.join(MIGRATIONS_DIR, fileName);

    fs.writeFileSync(filePath, fileContent);

    console.log(`Migration generated successfully: ${filePath}`);
    console.log(`  Class: ${className}`);
    console.log(`  Version: ${version}`);
  } finally {
    await connectionSource.destroy();
  }
};

main().catch((error) => {
  console.error('Error generating migration:', error);
  process.exit(1);
});
