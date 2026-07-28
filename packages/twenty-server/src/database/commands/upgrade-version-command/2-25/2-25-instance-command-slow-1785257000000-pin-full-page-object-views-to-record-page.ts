import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Objects that open on a full page used to be a hardcoded frontend list that
// clamped the resolved destination, so a workflow view set to the side panel
// still opened on a page. Now that the stored value is the whole answer, those
// views have to say what they were already doing.
@RegisteredInstanceCommand('2.25.0', 1785257000000, { type: 'slow' })
export class PinFullPageObjectViewsToRecordPageSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."view" AS "view"
         SET "openRecordIn" = 'RECORD_PAGE'
        FROM "core"."objectMetadata" AS "objectMetadata"
       WHERE "objectMetadata"."id" = "view"."objectMetadataId"
         AND "objectMetadata"."defaultOpenRecordIn" = 'RECORD_PAGE'
         AND "view"."openRecordIn" <> 'RECORD_PAGE'`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
