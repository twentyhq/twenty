import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { pascalCase } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { type UpgradeCommandVersion } from 'src/engine/constants/upgrade-command-supported-versions.constant';

type GenerateMigrationArgs = {
  migrationName: string;
  version: UpgradeCommandVersion;
  timestamp: number;
};

export type GeneratedMigrationResult = {
  fileName: string;
  fileTemplate: string;
  className: string;
};

@Injectable()
export class CoreMigrationGeneratorService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async generate({
    migrationName,
    version,
    timestamp,
  }: GenerateMigrationArgs): Promise<GeneratedMigrationResult | null> {
    const sqlInMemory = await this.dataSource.driver
      .createSchemaBuilder()
      .log();

    if (sqlInMemory.upQueries.length === 0) {
      return null;
    }

    const className = this.buildClassName(migrationName, version, timestamp);

    const upStatements = sqlInMemory.upQueries.map(
      ({ query, parameters }) =>
        `    await queryRunner.query('${this.escapeForSingleQuotedString(query)}'${this.formatQueryParams(parameters)});`,
    );

    const downStatements = sqlInMemory.downQueries
      .reverse()
      .map(
        ({ query, parameters }) =>
          `    await queryRunner.query('${this.escapeForSingleQuotedString(query)}'${this.formatQueryParams(parameters)});`,
      );

    const fileTemplate = this.buildMigrationFileContent(
      className,
      version,
      upStatements,
      downStatements,
    );

    const fileName = `${timestamp}-${version.replace(/\./g, '-')}-${migrationName}.ts`;

    return { fileName, fileTemplate, className };
  }

  private buildClassName(
    name: string,
    version: string,
    timestamp: number,
  ): string {
    return `${pascalCase(name)}V${version.replace(/\./g, '')}${timestamp}`;
  }

  private formatQueryParams(parameters: unknown[] | undefined): string {
    if (!parameters || !parameters.length) {
      return '';
    }

    return `, ${JSON.stringify(parameters)}`;
  }

  private escapeForSingleQuotedString(query: string): string {
    return query.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }

  private buildMigrationFileContent(
    className: string,
    version: string,
    upStatements: string[],
    downStatements: string[],
  ): string {
    return `import { MigrationInterface, QueryRunner } from 'typeorm';

import { RegisteredCoreMigration } from 'src/database/typeorm/core/decorators/registered-core-migration.decorator';

@RegisteredCoreMigration('${version}')
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
  }
}
