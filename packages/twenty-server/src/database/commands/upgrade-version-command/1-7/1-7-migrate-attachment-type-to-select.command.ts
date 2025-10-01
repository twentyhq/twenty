import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { DataSource, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { removeSqlDDLInjection } from 'src/engine/workspace-manager/workspace-migration-runner/utils/remove-sql-injection.util';
import { ATTACHMENT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

type TableExistsResult = {
  exists: boolean;
};

@Command({
  name: 'upgrade:1-7:migrate-attachment-type-to-select',
  description:
    'Migrate attachment type field from TEXT to SELECT in metadata and database schema',
})
export class MigrateAttachmentTypeToSelectCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace)
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    const schemaName = getWorkspaceSchemaName(workspaceId);

    this.logger.log(
      `Migrating attachment type field to SELECT for workspace ${workspaceId} in schema ${schemaName}`,
    );

    try {
      // Step 1: Update fieldMetadata for attachment type field
      await this.updateFieldMetadata(workspaceId);

      // Step 2: Create enum type and alter column in workspace schema
      await this.migrateAttachmentTypeColumn(workspaceId, schemaName);

      this.logger.log(
        `Successfully migrated attachment type field to SELECT for workspace ${workspaceId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to migrate attachment type field to SELECT for workspace ${workspaceId}: ${error.message}`,
      );
      throw error;
    }
  }

  private async updateFieldMetadata(workspaceId: string): Promise<void> {
    // Get the attachment object metadata
    const attachmentObjectMetadata =
      await this.objectMetadataRepository.findOne({
        where: {
          nameSingular: 'attachment',
          workspaceId,
        },
      });

    if (!attachmentObjectMetadata) {
      this.logger.log(
        `Attachment object not found in workspace ${workspaceId}, skipping metadata update`,
      );

      return;
    }

    // Get the type field metadata
    const fieldMetadata = await this.fieldMetadataRepository.findOne({
      where: {
        standardId: ATTACHMENT_STANDARD_FIELD_IDS.type,
        objectMetadataId: attachmentObjectMetadata.id,
        workspaceId,
      },
    });

    if (!fieldMetadata) {
      this.logger.log(
        `Attachment type field not found in workspace ${workspaceId}, skipping metadata update`,
      );

      return;
    }

    // Check if already migrated with correct default value
    if (
      fieldMetadata.type === 'SELECT' &&
      fieldMetadata.defaultValue === "'OTHER'"
    ) {
      this.logger.log(
        `Attachment type field already migrated to SELECT with correct default in workspace ${workspaceId}`,
      );

      return;
    }

    // Update field type to SELECT and add options
    const options = [
      { value: 'ARCHIVE', label: 'Archive', position: 0, color: 'gray' },
      { value: 'AUDIO', label: 'Audio', position: 1, color: 'pink' },
      { value: 'IMAGE', label: 'Image', position: 2, color: 'yellow' },
      {
        value: 'PRESENTATION',
        label: 'Presentation',
        position: 3,
        color: 'orange',
      },
      {
        value: 'SPREADSHEET',
        label: 'Spreadsheet',
        position: 4,
        color: 'turquoise',
      },
      {
        value: 'TEXT_DOCUMENT',
        label: 'Text Document',
        position: 5,
        color: 'blue',
      },
      { value: 'VIDEO', label: 'Video', position: 6, color: 'purple' },
      { value: 'OTHER', label: 'Other', position: 7, color: 'gray' },
    ];

    this.logger.log(
      `Updating fieldMetadata for attachment type field. Current type: ${fieldMetadata.type}, defaultValue: ${JSON.stringify(fieldMetadata.defaultValue)}`,
    );

    // Update field metadata
    // defaultValue for SELECT fields should be the SQL literal string (e.g., "'OTHER'")
    await this.fieldMetadataRepository.update(fieldMetadata.id, {
      type: FieldMetadataType.SELECT,
      options,
      defaultValue: "'OTHER'" as const,
    });

    // Verify the update
    const _updatedField = await this.fieldMetadataRepository.findOne({
      where: { id: fieldMetadata.id },
    });

    this.logger.log(
      `Updated fieldMetadata for attachment type field in workspace ${workspaceId}. New type: ${_updatedField?.type}, defaultValue: ${JSON.stringify(_updatedField?.defaultValue)}`,
    );
  }

  private async migrateAttachmentTypeColumn(
    workspaceId: string,
    schemaName: string,
  ): Promise<void> {
    // Check if attachment table exists
    const attachmentTableExists = (await this.coreDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${schemaName}'
        AND table_name = 'attachment'
      );
    `)) as TableExistsResult[];

    if (!attachmentTableExists[0]?.exists) {
      this.logger.log(
        `Attachment table does not exist in workspace ${workspaceId}, skipping column migration`,
      );

      return;
    }

    // Check if type column exists
    const typeColumnExists = (await this.coreDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = '${schemaName}'
        AND table_name = 'attachment'
        AND column_name = 'type'
      );
    `)) as TableExistsResult[];

    if (!typeColumnExists[0]?.exists) {
      this.logger.log(
        `Type column does not exist in attachment table for workspace ${workspaceId}, skipping column migration`,
      );

      return;
    }

    // Check if column is already an enum
    const columnDataType = (await this.coreDataSource.query(`
      SELECT data_type
      FROM information_schema.columns
      WHERE table_schema = '${schemaName}'
        AND table_name = 'attachment'
        AND column_name = 'type';
    `)) as Array<{ data_type: string }>;

    if (columnDataType[0]?.data_type === 'USER-DEFINED') {
      this.logger.log(
        `Type column is already an enum in workspace ${workspaceId}`,
      );

      return;
    }

    const enumValues = [
      'ARCHIVE',
      'AUDIO',
      'IMAGE',
      'PRESENTATION',
      'SPREADSHEET',
      'TEXT_DOCUMENT',
      'VIDEO',
      'OTHER',
    ];

    const enumName = removeSqlDDLInjection('attachment_type_enum');
    const joinedEnumValues = enumValues
      .map((value) => removeSqlDDLInjection(value))
      .map((value) => `'${value}'`)
      .join(',');

    // Drop enum type if it exists (in case of previous failed migration)
    await this.coreDataSource.query(
      `DROP TYPE IF EXISTS "${schemaName}"."${enumName}"`,
    );

    // Create enum type
    await this.coreDataSource.query(
      `CREATE TYPE "${schemaName}"."${enumName}" AS ENUM (${joinedEnumValues})`,
    );

    this.logger.log(
      `Created enum type "${enumName}" in workspace ${workspaceId}`,
    );

    // Drop the default value first (if it exists) to avoid casting issues
    await this.coreDataSource.query(`
      ALTER TABLE "${schemaName}"."attachment"
      ALTER COLUMN "type" DROP DEFAULT;
    `);

    // Alter column type from text to enum
    // Use USING to handle the conversion, defaulting invalid values to 'OTHER'
    // Handle NULL, empty strings, and invalid values
    await this.coreDataSource.query(`
      ALTER TABLE "${schemaName}"."attachment"
      ALTER COLUMN "type" TYPE "${schemaName}"."${enumName}"
      USING CASE
        WHEN "type" IS NULL OR "type" = '' THEN 'OTHER'::"${schemaName}"."${enumName}"
        WHEN "type" IN (${joinedEnumValues}) THEN "type"::"${schemaName}"."${enumName}"
        ELSE 'OTHER'::"${schemaName}"."${enumName}"
      END;
    `);

    this.logger.log(
      `Altered type column to use enum type in workspace ${workspaceId}`,
    );

    // Set default value to 'OTHER' for the enum column
    await this.coreDataSource.query(`
      ALTER TABLE "${schemaName}"."attachment"
      ALTER COLUMN "type" SET DEFAULT 'OTHER'::"${schemaName}"."${enumName}";
    `);

    this.logger.log(
      `Set default value to 'OTHER' for type column in workspace ${workspaceId}`,
    );
  }
}
