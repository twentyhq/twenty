import { Logger } from '@nestjs/common';

import { join } from 'path';

import { type Manifest } from 'twenty-shared/application';
import { ServerFileFolder } from 'twenty-shared/types';
import { DataSource, QueryRunner } from 'typeorm';

import { type ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { buildApplicationManifestResourcePath } from 'src/engine/core-modules/application/application-registration/utils/build-application-manifest-resource-path.util';
import { SERVER_FILE_STORAGE_PREFIX } from 'src/engine/core-modules/file-storage/constants/server-file-storage-prefix.constant';
import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import { validateStoragePathIsWithinServerScopeOrThrow } from 'src/engine/core-modules/file-storage/utils/validate-storage-path-is-within-server-scope-or-throw.util';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

type ApplicationRegistrationRow = {
  id: string;
  sourceType: ApplicationRegistrationSourceType;
  latestAvailableVersion: string | null;
  manifest: Manifest;
};

// Uses raw SQL for the file row: entity-based writes are unavailable here
// because "applicationRegistrationId" is introduced by an upgrade command of
// this same version, so @WasIntroducedInUpgrade excludes it from FileEntity
// metadata for the whole upgrade run.
@RegisteredInstanceCommand('2.20.0', 1783499671543, { type: 'slow' })
export class BackfillManifestFileIdOnApplicationRegistrationSlowInstanceCommand
  implements SlowInstanceCommand
{
  private readonly logger = new Logger(
    BackfillManifestFileIdOnApplicationRegistrationSlowInstanceCommand.name,
  );

  constructor(
    private readonly fileStorageDriverFactory: FileStorageDriverFactory,
  ) {}

  async runDataMigration(dataSource: DataSource): Promise<void> {
    const rows: ApplicationRegistrationRow[] = await dataSource.query(
      `SELECT id, "sourceType", "latestAvailableVersion", "manifest" FROM "core"."applicationRegistration" WHERE "manifest" IS NOT NULL AND "manifestFileId" IS NULL`,
    );

    for (const row of rows) {
      try {
        const serializedManifest = JSON.stringify(row.manifest);

        const resourcePath = buildApplicationManifestResourcePath({
          sourceType: row.sourceType,
          version: row.latestAvailableVersion,
          serializedManifest,
        });

        const filePath = join(
          ServerFileFolder.ApplicationRegistration,
          row.id,
          resourcePath,
        ).replace(/\/+/g, '/');

        const onStorageFilePath = join(
          SERVER_FILE_STORAGE_PREFIX,
          filePath,
        ).replace(/\/+/g, '/');

        validateStoragePathIsWithinServerScopeOrThrow({
          onStoragePath: onStorageFilePath,
          fileFolder: ServerFileFolder.ApplicationRegistration,
        });

        await this.fileStorageDriverFactory.getCurrentDriver().writeFile({
          filePath: onStorageFilePath,
          mimeType: 'application/json',
          sourceFile: serializedManifest,
        });

        const [manifestFile]: { id: string }[] = await dataSource.query(
          `INSERT INTO "core"."file" ("path", "workspaceId", "applicationRegistrationId", "size", "mimeType")
           VALUES ($1, NULL, $2, $3, 'application/json')
           ON CONFLICT ("applicationRegistrationId", "path")
           DO UPDATE SET "size" = EXCLUDED."size", "mimeType" = EXCLUDED."mimeType", "updatedAt" = now()
           RETURNING id`,
          [filePath, row.id, Buffer.byteLength(serializedManifest)],
        );

        await dataSource.query(
          `UPDATE "core"."applicationRegistration" SET "manifestFileId" = $1 WHERE id = $2 AND "manifestFileId" IS NULL`,
          [manifestFile.id, row.id],
        );
      } catch (error) {
        this.logger.warn(
          `Failed to backfill manifest file for application registration ${row.id}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'UPDATE "core"."applicationRegistration" SET "manifestFileId" = NULL',
    );
  }
}
