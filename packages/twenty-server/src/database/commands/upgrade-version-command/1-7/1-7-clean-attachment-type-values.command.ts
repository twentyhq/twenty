import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

type TableExistsResult = {
  exists: boolean;
};

type AttachmentTypeResult = {
  type: string;
};

type AttachmentTypeCountResult = {
  type: string;
  count: string;
};

@Command({
  name: 'upgrade:1-7:clean-attachment-type-values',
  description:
    'Clean up attachment type values to match new uppercase format and remove invalid values',
})
export class CleanAttachmentTypeValuesCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace)
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    const schemaName = getWorkspaceSchemaName(workspaceId);

    this.logger.log(
      `Cleaning attachment type values for workspace ${workspaceId} in schema ${schemaName}`,
    );

    const attachmentTableExists = (await this.coreDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${schemaName}'
        AND table_name = 'attachment'
      );
    `)) as TableExistsResult[];

    if (!attachmentTableExists[0]?.exists) {
      this.logger.log(
        `Attachment table does not exist in workspace ${workspaceId}, skipping`,
      );

      return;
    }

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
        `Type column does not exist in attachment table for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    try {
      // Get current attachment type values to see what needs to be cleaned
      const currentTypes = (await this.coreDataSource.query(`
        SELECT DISTINCT "type" FROM "${schemaName}"."attachment" WHERE "type" IS NOT NULL;
      `)) as AttachmentTypeResult[];

      this.logger.log(
        `Found attachment types in workspace ${workspaceId}: ${currentTypes.map((t) => t.type).join(', ')}`,
      );

      // Update attachment type values to uppercase format
      // Archive
      await this.coreDataSource.query(`
        UPDATE "${schemaName}"."attachment"
        SET "type" = 'ARCHIVE'
        WHERE UPPER("type") IN ('ARCHIVE', 'ZIP', 'TAR', 'ISO', 'GZ', 'RAR', '7Z');
      `);

      // Audio
      await this.coreDataSource.query(`
        UPDATE "${schemaName}"."attachment"
        SET "type" = 'AUDIO'
        WHERE UPPER("type") IN ('AUDIO', 'MP3', 'WAV', 'OGG', 'WMA');
      `);

      // Image
      await this.coreDataSource.query(`
        UPDATE "${schemaName}"."attachment"
        SET "type" = 'IMAGE'
        WHERE UPPER("type") IN ('IMAGE', 'PNG', 'JPG', 'JPEG', 'SVG', 'GIF', 'WEBP', 'HEIF', 'TIF', 'TIFF', 'BMP', 'ICO');
      `);

      // Presentation
      await this.coreDataSource.query(`
        UPDATE "${schemaName}"."attachment"
        SET "type" = 'PRESENTATION'
        WHERE UPPER("type") IN ('PRESENTATION', 'PPT', 'PPTX', 'POTX', 'ODP', 'HTML', 'KEY', 'KTH');
      `);

      // Spreadsheet
      await this.coreDataSource.query(`
        UPDATE "${schemaName}"."attachment"
        SET "type" = 'SPREADSHEET'
        WHERE UPPER("type") IN ('SPREADSHEET', 'XLS', 'XLSB', 'XLSM', 'XLSX', 'XLTX', 'CSV', 'TSV', 'ODS', 'NUMBERS');
      `);

      // TextDocument (handle both TextDocument and TEXT_DOCUMENT formats)
      await this.coreDataSource.query(`
        UPDATE "${schemaName}"."attachment"
        SET "type" = 'TEXT_DOCUMENT'
        WHERE UPPER("type") IN ('TEXTDOCUMENT', 'TEXT_DOCUMENT', 'DOCUMENT', 'DOC', 'DOCM', 'DOCX', 'DOT', 'DOTX', 'ODT', 'PDF', 'TXT', 'RTF', 'PS', 'TEX', 'PAGES');
      `);

      // Video
      await this.coreDataSource.query(`
        UPDATE "${schemaName}"."attachment"
        SET "type" = 'VIDEO'
        WHERE UPPER("type") IN ('VIDEO', 'MP4', 'AVI', 'MOV', 'WMV', 'MPG', 'MPEG');
      `);

      // Set any remaining unrecognized types to 'OTHER'
      await this.coreDataSource.query(`
        UPDATE "${schemaName}"."attachment"
        SET "type" = 'OTHER'
        WHERE "type" NOT IN ('ARCHIVE', 'AUDIO', 'IMAGE', 'PRESENTATION', 'SPREADSHEET', 'TEXT_DOCUMENT', 'VIDEO', 'OTHER');
      `);

      // Get final count of updated records
      const finalCounts = (await this.coreDataSource.query(`
        SELECT "type", COUNT(*) as count
        FROM "${schemaName}"."attachment"
        WHERE "type" IS NOT NULL
        GROUP BY "type"
        ORDER BY "type";
      `)) as AttachmentTypeCountResult[];

      this.logger.log(
        `Successfully cleaned attachment types for workspace ${workspaceId}. Final counts: ${finalCounts.map((c) => `${c.type}: ${c.count}`).join(', ')}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to clean attachment type values for workspace ${workspaceId}: ${error.message}`,
      );
      throw error;
    }
  }
}
