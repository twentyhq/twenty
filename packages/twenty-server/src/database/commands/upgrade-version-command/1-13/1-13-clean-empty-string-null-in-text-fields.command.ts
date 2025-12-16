import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { GlobalWorkspaceDataSource } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@Command({
  name: 'upgrade:1-13:clean-empty-string-null-in-text-fields',
  description:
    'Clean up empty string defaults in TEXT fields and convert them to NULL',
})
export class CleanEmptyStringNullInTextFieldsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(
    CleanEmptyStringNullInTextFieldsCommand.name,
  );

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(ObjectMetadataEntity)
    protected readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    protected readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun || false;

    if (!isDefined(dataSource)) {
      throw new Error(
        `Could not find data source for workspace ${workspaceId}, should never occur`,
      );
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!isDefined(workspace)) {
      throw new Error(
        `Could not find workspace ${workspaceId}, should never occur`,
      );
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);

    if (isDryRun) {
      this.logger.log('Dry run mode: No changes will be applied');
    }

    const objectMetadataItems = await this.objectMetadataRepository.find({
      where: { workspaceId },
      relations: ['fields'],
    });

    for (const objectMetadataItem of objectMetadataItems) {
      try {
        const tableName = computeObjectTargetTable(objectMetadataItem);

        if (!objectMetadataItem.isCustom) {
          await this.cleanUpEmptyStringDefaultsInTextFieldsInStandardObjects(
            objectMetadataItem,
            tableName,
            schemaName,
            dataSource,
            isDryRun,
          );
        }

        if (objectMetadataItem.isCustom) {
          await this.cleanUpEmptyStringDefaultsAndSetNullableInNameFieldInCustomObjects(
            objectMetadataItem,
            tableName,
            schemaName,
            dataSource,
            isDryRun,
          );
        }
      } catch (error) {
        this.logger.error(
          `Could not cleanup ${objectMetadataItem.isCustom ? 'custom' : 'standard'} object ${objectMetadataItem.nameSingular} records for workspace ${workspaceId}`,
        );
        this.logger.error(error);
      }
    }
  }

  private async cleanUpEmptyStringDefaultsInTextFieldsInStandardObjects(
    objectMetadataItem: ObjectMetadataEntity,
    tableName: string,
    schemaName: string,
    dataSource: GlobalWorkspaceDataSource,
    isDryRun: boolean,
  ): Promise<void> {
    const textFields = objectMetadataItem.fields.filter(
      (field) =>
        field.type === FieldMetadataType.TEXT &&
        field.isNullable === true &&
        field.defaultValue === null,
    );

    for (const field of textFields) {
      this.logger.log(
        `Checking field ${field.name} on standard object ${objectMetadataItem.nameSingular} (Table: ${tableName})`,
      );

      this.logger.log(
        `Cleaning up empty string default for field ${field.name} on ${tableName}`,
      );

      if (!isDryRun) {
        await dataSource.query(
          `ALTER TABLE "${schemaName}"."${tableName}" ALTER COLUMN "${field.name}" DROP DEFAULT`,
          [],
          undefined,
          { shouldBypassPermissionChecks: true },
        );

        await dataSource.query(
          `UPDATE "${schemaName}"."${tableName}" SET "${field.name}" = NULL WHERE "${field.name}" = ''`,
          [],
          undefined,
          { shouldBypassPermissionChecks: true },
        );
      }
    }
  }

  private async cleanUpEmptyStringDefaultsAndSetNullableInNameFieldInCustomObjects(
    objectMetadataItem: ObjectMetadataEntity,
    tableName: string,
    schemaName: string,
    dataSource: GlobalWorkspaceDataSource,
    isDryRun: boolean,
  ): Promise<void> {
    const nameField = objectMetadataItem.fields.find(
      (field) =>
        field.name === 'name' &&
        field.type === FieldMetadataType.TEXT &&
        field.defaultValue === "''",
    );

    if (!isDefined(nameField)) {
      return;
    }

    this.logger.log(
      `Found "name" field with empty string default on ${objectMetadataItem.nameSingular} (Table: ${tableName})`,
    );

    if (!isDryRun) {
      await dataSource.query(
        `ALTER TABLE "${schemaName}"."${tableName}" ALTER COLUMN "name" DROP DEFAULT, ALTER COLUMN "name" DROP NOT NULL`,
        [],
        undefined,
        { shouldBypassPermissionChecks: true },
      );

      await dataSource.query(
        `UPDATE "${schemaName}"."${tableName}" SET "name" = NULL WHERE "name" = ''`,
        [],
        undefined,
        { shouldBypassPermissionChecks: true },
      );

      await this.fieldMetadataRepository.update(nameField.id, {
        defaultValue: null,
        isNullable: true,
      });

      this.logger.log(
        `Updated "name" field metadata and cleaned empty strings for ${objectMetadataItem.nameSingular}`,
      );
    }
  }
}
