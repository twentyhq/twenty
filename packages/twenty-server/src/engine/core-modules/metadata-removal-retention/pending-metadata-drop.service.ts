import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import {
  DataSource,
  LessThanOrEqual,
  type QueryRunner,
  Repository,
} from 'typeorm';

import { PendingMetadataDropEntity } from 'src/engine/core-modules/metadata-removal-retention/pending-metadata-drop.entity';
import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export type ReclaimOutcome = 'reused' | 'dropped' | 'none';

@Injectable()
export class PendingMetadataDropService {
  private readonly logger = new Logger(PendingMetadataDropService.name);

  constructor(
    @InjectRepository(PendingMetadataDropEntity)
    private readonly pendingMetadataDropRepository: Repository<PendingMetadataDropEntity>,
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  async recordColumnDrop(params: {
    queryRunner: QueryRunner;
    workspaceId: string;
    applicationId: string | null;
    schemaName: string;
    tableName: string;
    columnNames: string[];
    enumNames: string[];
    columnDefinitions: WorkspaceSchemaColumnDefinition[];
    retentionDays: number;
  }): Promise<void> {
    const removedAt = new Date();

    await params.queryRunner.manager
      .getRepository(PendingMetadataDropEntity)
      .insert({
        kind: 'COLUMN',
        workspaceId: params.workspaceId,
        applicationId: params.applicationId,
        schemaName: params.schemaName,
        tableName: params.tableName,
        columnNames: params.columnNames,
        enumNames: params.enumNames,
        columnDefinitions: params.columnDefinitions,
        removedAt,
        scheduledDropAt: new Date(
          removedAt.getTime() + params.retentionDays * MILLISECONDS_PER_DAY,
        ),
      });
  }

  async recordTableDrop(params: {
    queryRunner: QueryRunner;
    workspaceId: string;
    applicationId: string | null;
    schemaName: string;
    tableName: string;
    enumNames: string[];
    columnDefinitions: WorkspaceSchemaColumnDefinition[];
    retentionDays: number;
  }): Promise<void> {
    const removedAt = new Date();

    await params.queryRunner.manager
      .getRepository(PendingMetadataDropEntity)
      .insert({
        kind: 'TABLE',
        workspaceId: params.workspaceId,
        applicationId: params.applicationId,
        schemaName: params.schemaName,
        tableName: params.tableName,
        columnNames: [],
        enumNames: params.enumNames,
        columnDefinitions: params.columnDefinitions,
        removedAt,
        scheduledDropAt: new Date(
          removedAt.getTime() + params.retentionDays * MILLISECONDS_PER_DAY,
        ),
      });
  }

  async reclaimColumns(params: {
    queryRunner: QueryRunner;
    workspaceId: string;
    schemaName: string;
    tableName: string;
    columnNames: string[];
    columnDefinitions: WorkspaceSchemaColumnDefinition[];
  }): Promise<ReclaimOutcome> {
    const repository = params.queryRunner.manager.getRepository(
      PendingMetadataDropEntity,
    );

    const entry = await repository.findOne({
      where: {
        kind: 'COLUMN',
        workspaceId: params.workspaceId,
        schemaName: params.schemaName,
        tableName: params.tableName,
      },
      order: { removedAt: 'DESC' },
    });

    if (
      entry === null ||
      !this.columnNamesMatch(entry.columnNames, params.columnNames)
    ) {
      return 'none';
    }

    if (
      this.definitionsMatch(entry.columnDefinitions, params.columnDefinitions)
    ) {
      await repository.delete(entry.id);

      return 'reused';
    }

    await this.executeDeferredDrop({ entry, queryRunner: params.queryRunner });
    await repository.delete(entry.id);

    return 'dropped';
  }

  async reclaimTable(params: {
    queryRunner: QueryRunner;
    workspaceId: string;
    schemaName: string;
    tableName: string;
    columnDefinitions: WorkspaceSchemaColumnDefinition[];
  }): Promise<ReclaimOutcome> {
    const repository = params.queryRunner.manager.getRepository(
      PendingMetadataDropEntity,
    );

    const entry = await repository.findOne({
      where: {
        kind: 'TABLE',
        workspaceId: params.workspaceId,
        schemaName: params.schemaName,
        tableName: params.tableName,
      },
      order: { removedAt: 'DESC' },
    });

    if (entry === null) {
      return 'none';
    }

    if (
      this.definitionsMatch(entry.columnDefinitions, params.columnDefinitions)
    ) {
      await repository.delete(entry.id);

      return 'reused';
    }

    await this.executeDeferredDrop({ entry, queryRunner: params.queryRunner });
    await repository.delete(entry.id);

    return 'dropped';
  }

  async findWorkspaceIdsWithDueDrops(now: Date): Promise<string[]> {
    const dueDrops = await this.pendingMetadataDropRepository.find({
      where: { scheduledDropAt: LessThanOrEqual(now) },
      select: { workspaceId: true },
    });

    return [...new Set(dueDrops.map((drop) => drop.workspaceId))];
  }

  async dropDueForWorkspace(params: {
    workspaceId: string;
    now: Date;
  }): Promise<void> {
    const dueDrops = await this.pendingMetadataDropRepository.find({
      where: {
        workspaceId: params.workspaceId,
        scheduledDropAt: LessThanOrEqual(params.now),
      },
    });

    if (dueDrops.length === 0) {
      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      for (const entry of dueDrops) {
        await queryRunner.startTransaction();

        try {
          await this.executeDeferredDrop({ entry, queryRunner });
          await queryRunner.manager
            .getRepository(PendingMetadataDropEntity)
            .delete(entry.id);
          await queryRunner.commitTransaction();
        } catch (error) {
          await queryRunner.rollbackTransaction();

          this.logger.error(
            `Failed to drop retained ${entry.kind.toLowerCase()} ${entry.schemaName}.${entry.tableName} (${entry.id})`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }
    } finally {
      await queryRunner.release();
    }
  }

  private async executeDeferredDrop(params: {
    entry: PendingMetadataDropEntity;
    queryRunner: QueryRunner;
  }): Promise<void> {
    const { entry, queryRunner } = params;

    if (entry.kind === 'COLUMN') {
      await this.workspaceSchemaManagerService.columnManager.dropColumns({
        queryRunner,
        schemaName: entry.schemaName,
        tableName: entry.tableName,
        columnNames: entry.columnNames,
        cascade: true,
      });
    } else {
      await this.workspaceSchemaManagerService.tableManager.dropTable({
        queryRunner,
        schemaName: entry.schemaName,
        tableName: entry.tableName,
        cascade: true,
      });
    }

    for (const enumName of entry.enumNames) {
      await this.workspaceSchemaManagerService.enumManager.dropEnum({
        queryRunner,
        schemaName: entry.schemaName,
        enumName,
      });
    }
  }

  private columnNamesMatch(left: string[], right: string[]): boolean {
    return (
      left.length === right.length &&
      [...left].sort().join(',') === [...right].sort().join(',')
    );
  }

  private definitionsMatch(
    left: WorkspaceSchemaColumnDefinition[] | null,
    right: WorkspaceSchemaColumnDefinition[],
  ): boolean {
    if (left === null) {
      return false;
    }

    return this.normalizeDefinitions(left) === this.normalizeDefinitions(right);
  }

  private normalizeDefinitions(
    definitions: WorkspaceSchemaColumnDefinition[],
  ): string {
    const canonicalDefinitions = definitions
      .map((definition) =>
        Object.fromEntries(
          Object.entries(definition).sort(([leftKey], [rightKey]) =>
            leftKey.localeCompare(rightKey),
          ),
        ),
      )
      .sort((left, right) =>
        String(left.name).localeCompare(String(right.name)),
      );

    return JSON.stringify(canonicalDefinitions);
  }
}
