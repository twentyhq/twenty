import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { pascalCase } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { type TwentyAllVersion } from 'src/engine/core-modules/upgrade/constants/twenty-all-versions.constant';
import { type InstanceCommandType } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';

type GenerateInstanceCommandArgs = {
  migrationName: string;
  version: TwentyAllVersion;
  timestamp: number;
  type?: InstanceCommandType;
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

  async generateInstanceCommand({
    migrationName,
    version,
    timestamp,
    type = 'fast',
  }: GenerateInstanceCommandArgs): Promise<GeneratedMigrationResult | null> {
    const sqlInMemory = await this.dataSource.driver
      .createSchemaBuilder()
      .log();

    if (sqlInMemory.upQueries.length === 0) {
      return null;
    }

    const className = this.buildClassName({ name: migrationName, type });

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

    const fileTemplate =
      type === 'slow'
        ? this.buildSlowMigrationFileContent({
            className,
            version,
            timestamp,
            upStatements,
            downStatements,
          })
        : this.buildFastMigrationFileContent({
            className,
            version,
            timestamp,
            upStatements,
            downStatements,
          });

    const versionSlug = version.split('.').slice(0, 2).join('-');
    const fileName = `${versionSlug}-instance-command-${type}-${timestamp}-${migrationName}.ts`;

    return { fileName, fileTemplate, className };
  }

  private buildClassName({
    name,
    type,
  }: {
    name: string;
    type: InstanceCommandType;
  }): string {
    return `${pascalCase(name)}${pascalCase(type)}InstanceCommand`;
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

  private buildFastMigrationFileContent({
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
    return `import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('${version}', ${timestamp})
export class ${className} implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
${upStatements.join('\n')}
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
${downStatements.join('\n')}
  }
}
`;
  }

  private buildSlowMigrationFileContent({
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
    return `import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('${version}', ${timestamp}, { type: 'slow' })
export class ${className} implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    // TODO: implement data backfill before the DDL migration
  }

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
