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
export class InstanceCommandGenerationService {
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

    const className = this.buildClassName(migrationName);

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

    const fileTemplate = this.buildMigrationFileContent({
      className,
      version,
      timestamp,
      upStatements,
      downStatements,
    });

    const versionSlug = version.split('.').slice(0, 2).join('-');
    const fileName = `${versionSlug}-instance-command-fast-${timestamp}-${migrationName}.ts`;

    return { fileName, fileTemplate, className };
  }

  private buildClassName(name: string): string {
    return `${pascalCase(name)}Command`;
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

  private buildMigrationFileContent({
    className,
    version,
    timestamp,
    upStatements,
    downStatements,
  }: {
    className: string;
    version: string;
    timestamp: number;
    upStatements: string[];
    downStatements: string[];
  }): string {
    return `import { MigrationInterface, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';

@RegisteredInstanceCommand('${version}', ${timestamp})
export class ${className} implements MigrationInterface {
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
