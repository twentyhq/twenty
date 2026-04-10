import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { once } from 'events';
import { type WriteStream, createWriteStream, mkdirSync } from 'fs';
import { finished } from 'stream/promises';

import {
  DataSource,
  type EntityMetadata,
  type QueryRunner,
  Repository,
} from 'typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { getCoreEntityMetadatasWithWorkspaceId } from 'src/database/commands/workspace-export/utils/get-core-entity-metadatas-with-workspace-id.util';
import { generateWorkspaceSchemaDdl } from 'src/database/commands/workspace-export/utils/generate-workspace-schema-ddl.util';
import { buildInsertPrefix } from 'src/database/commands/workspace-export/utils/build-insert-prefix.util';
import { buildWorkspaceTableColumnSets } from 'src/database/commands/workspace-export/utils/build-workspace-table-column-sets.util';
import { formatSqlValue } from 'src/database/commands/workspace-export/utils/format-sql-value.util';
import { generateInsertStatement } from 'src/database/commands/workspace-export/utils/generate-insert-statement.util';

const BATCH_SIZE = 5000;

type WorkspaceExportParams = {
  workspaceId: string;
  outputPath: string;
  tableFilter?: string[];
};

type WriteRowsOptions = {
  schemaName: string;
  tableName: string;
  displayName: string;
  queryRunner: QueryRunner;
  stream: WriteStream;
  whereClause?: string;
  queryParameters?: unknown[];
  jsonColumns?: Set<string>;
  excludedColumns?: Set<string>;
};

@Injectable()
export class WorkspaceExportService {
  private readonly logger = new Logger(WorkspaceExportService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {}

  async exportWorkspace({
    workspaceId,
    outputPath,
    tableFilter,
  }: WorkspaceExportParams): Promise<string> {
    const workspace = await this.dataSource
      .getRepository(WorkspaceEntity)
      .findOne({ where: { id: workspaceId } });

    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);

    this.logger.log(`Exporting workspace ${workspaceId} (${schemaName})`);

    const objectMetadatas = await this.objectMetadataRepository.find({
      where: { workspaceId },
    });

    const fieldMetadatas = await this.fieldMetadataRepository.find({
      where: { workspaceId },
    });

    const fieldsByObjectId = new Map<string, FieldMetadataEntity[]>();

    for (const fieldMetadata of fieldMetadatas) {
      const objectFields =
        fieldsByObjectId.get(fieldMetadata.objectMetadataId) ?? [];

      objectFields.push(fieldMetadata);
      fieldsByObjectId.set(fieldMetadata.objectMetadataId, objectFields);
    }

    mkdirSync(outputPath, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = `${outputPath}/${workspaceId}-${timestamp}.sql`;
    const stream = createWriteStream(filePath);

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      stream.write("SET session_replication_role = 'replica';\n\n");

      await this.writeCoreEntityRows(workspaceId, queryRunner, stream);

      stream.write(
        `\nCREATE SCHEMA IF NOT EXISTS ${escapeIdentifier(schemaName)};\n\n`,
      );

      this.writeWorkspaceSchemaDdl(
        workspaceId,
        schemaName,
        objectMetadatas,
        fieldsByObjectId,
        stream,
      );

      await this.writeWorkspaceDataRows(
        workspaceId,
        schemaName,
        objectMetadatas,
        fieldsByObjectId,
        tableFilter,
        queryRunner,
        stream,
      );

      stream.write("\nSET session_replication_role = 'origin';\n");
    } finally {
      await queryRunner.release();
      stream.end();
      await finished(stream);
    }

    return filePath;
  }

  private async writeCoreEntityRows(
    workspaceId: string,
    queryRunner: QueryRunner,
    stream: WriteStream,
  ): Promise<void> {
    const workspaceEntityMetadata = this.dataSource.entityMetadatas.find(
      (entityMetadata) => entityMetadata.tableName === 'workspace',
    );

    if (workspaceEntityMetadata) {
      await this.writeRows({
        schemaName: workspaceEntityMetadata.schema || 'core',
        tableName: workspaceEntityMetadata.tableName,
        displayName: workspaceEntityMetadata.tableName,
        queryRunner,
        stream,
        whereClause: '"id" = $1',
        queryParameters: [workspaceId],
        jsonColumns: this.buildJsonColumnSet(workspaceEntityMetadata),
      });
    }

    const coreEntityMetadatas = getCoreEntityMetadatasWithWorkspaceId(
      this.dataSource,
    );

    for (const entityMetadata of coreEntityMetadatas) {
      try {
        await this.writeRows({
          schemaName: entityMetadata.schema || 'core',
          tableName: entityMetadata.tableName,
          displayName: entityMetadata.tableName,
          queryRunner,
          stream,
          whereClause: '"workspaceId" = $1',
          queryParameters: [workspaceId],
          jsonColumns: this.buildJsonColumnSet(entityMetadata),
        });
      } catch (error) {
        this.logger.warn(`${entityMetadata.tableName}: skipped`, error);
      }
    }

    const userEntityMetadata = this.dataSource.entityMetadatas.find(
      (entityMetadata) => entityMetadata.tableName === 'user',
    );

    if (userEntityMetadata) {
      await this.writeRows({
        schemaName: userEntityMetadata.schema || 'core',
        tableName: userEntityMetadata.tableName,
        displayName: userEntityMetadata.tableName,
        queryRunner,
        stream,
        whereClause:
          '"id" IN (SELECT "userId" FROM "core"."userWorkspace" WHERE "workspaceId" = $1)',
        queryParameters: [workspaceId],
        jsonColumns: this.buildJsonColumnSet(userEntityMetadata),
      });
    }
  }

  private buildJsonColumnSet(entityMetadata: EntityMetadata): Set<string> {
    return new Set(
      entityMetadata.columns
        .filter((column) => column.type === 'jsonb' || column.type === 'json')
        .map((column) => column.databaseName),
    );
  }

  private async writeRows({
    schemaName,
    tableName,
    displayName,
    queryRunner,
    stream,
    whereClause,
    queryParameters = [],
    jsonColumns,
    excludedColumns,
  }: WriteRowsOptions): Promise<void> {
    const whereFragment = whereClause ? ` WHERE ${whereClause}` : '';

    const [{ count: totalCount }] = await queryRunner.query(
      `SELECT COUNT(*)::int as count FROM "${schemaName}"."${tableName}"${whereFragment}`,
      queryParameters,
    );

    if (totalCount === 0) return;

    this.logger.log(`  ${displayName}: ${totalCount} rows`);

    let insertPrefix: string | undefined;

    for (let offset = 0; offset < totalCount; offset += BATCH_SIZE) {
      const rows: Record<string, unknown>[] = await queryRunner.query(
        `SELECT * FROM "${schemaName}"."${tableName}"${whereFragment} ORDER BY "id" LIMIT ${BATCH_SIZE} OFFSET ${offset}`,
        queryParameters,
      );

      const batchStatements: string[] = [];

      for (const row of rows) {
        const columnNames = Object.keys(row).filter(
          (columnName) => !excludedColumns?.has(columnName),
        );

        if (!insertPrefix) {
          insertPrefix = buildInsertPrefix(schemaName, tableName, columnNames);
        }

        const formattedValues = columnNames.map((columnName) =>
          formatSqlValue(row[columnName], jsonColumns?.has(columnName)),
        );

        batchStatements.push(
          generateInsertStatement(insertPrefix, formattedValues),
        );
      }

      if (!stream.write(batchStatements.join(''))) {
        await once(stream, 'drain');
      }
    }
  }

  private writeWorkspaceSchemaDdl(
    workspaceId: string,
    schemaName: string,
    objectMetadatas: ObjectMetadataEntity[],
    fieldsByObjectId: Map<string, FieldMetadataEntity[]>,
    stream: WriteStream,
  ): void {
    this.logger.log('Generating workspace schema DDL from metadata...');

    const ddlStatements = generateWorkspaceSchemaDdl(
      workspaceId,
      schemaName,
      objectMetadatas,
      fieldsByObjectId,
    );

    this.logger.log(`  ${ddlStatements.length} DDL statements`);

    for (const statement of ddlStatements) {
      stream.write(statement + '\n');
    }

    stream.write('\n');
  }

  private async writeWorkspaceDataRows(
    workspaceId: string,
    schemaName: string,
    objectMetadatas: ObjectMetadataEntity[],
    fieldsByObjectId: Map<string, FieldMetadataEntity[]>,
    tableFilter: string[] | undefined,
    queryRunner: QueryRunner,
    stream: WriteStream,
  ): Promise<void> {
    for (const objectMetadata of objectMetadatas) {
      if (!objectMetadata.isActive) continue;

      const tableName = computeTableName(
        objectMetadata.nameSingular,
        objectMetadata.isCustom,
      );

      if (tableFilter && !tableFilter.includes(objectMetadata.nameSingular)) {
        continue;
      }

      const objectFieldMetadatas =
        fieldsByObjectId.get(objectMetadata.id) ?? [];

      const { jsonColumns, generatedColumns } = buildWorkspaceTableColumnSets(
        workspaceId,
        objectMetadata,
        objectFieldMetadatas,
      );

      try {
        await this.writeRows({
          schemaName,
          tableName,
          displayName: objectMetadata.nameSingular,
          queryRunner,
          stream,
          jsonColumns,
          excludedColumns: generatedColumns,
        });
      } catch (error) {
        this.logger.warn(`${objectMetadata.nameSingular}: skipped`, error);
      }
    }
  }
}
