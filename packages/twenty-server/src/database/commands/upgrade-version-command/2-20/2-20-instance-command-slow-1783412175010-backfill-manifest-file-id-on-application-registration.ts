import { Logger } from '@nestjs/common';

import { type Manifest } from 'twenty-shared/application';
import { DataSource, QueryRunner } from 'typeorm';

import { ApplicationManifestStorageService } from 'src/engine/core-modules/application/application-registration/application-manifest-storage.service';
import { type ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

type ApplicationRegistrationRow = {
  id: string;
  sourceType: ApplicationRegistrationSourceType;
  latestAvailableVersion: string | null;
  manifest: Manifest;
};

@RegisteredInstanceCommand('2.20.0', 1783412175010, { type: 'slow' })
export class BackfillManifestFileIdOnApplicationRegistrationSlowInstanceCommand
  implements SlowInstanceCommand
{
  private readonly logger = new Logger(
    BackfillManifestFileIdOnApplicationRegistrationSlowInstanceCommand.name,
  );

  constructor(
    private readonly applicationManifestStorageService: ApplicationManifestStorageService,
  ) {}

  async runDataMigration(dataSource: DataSource): Promise<void> {
    const rows: ApplicationRegistrationRow[] = await dataSource.query(
      `SELECT id, "sourceType", "latestAvailableVersion", "manifest" FROM "core"."applicationRegistration" WHERE "manifest" IS NOT NULL AND "manifestFileId" IS NULL`,
    );

    for (const row of rows) {
      try {
        const manifestFile =
          await this.applicationManifestStorageService.writeManifest({
            applicationRegistrationId: row.id,
            manifest: row.manifest,
            sourceType: row.sourceType,
            version: row.latestAvailableVersion,
          });

        await dataSource.query(
          `UPDATE "core"."applicationRegistration" SET "manifestFileId" = $1 WHERE id = $2`,
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
