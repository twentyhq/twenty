import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.20.0', 1783615890056, { type: 'slow' })
export class BackfillGalleryImagesOnApplicationRegistrationSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."applicationRegistration" AS "registration"
      SET "galleryImages" = "screenshotEntries"."galleryImages"
      FROM (
        SELECT
          "id",
          jsonb_agg(
            jsonb_build_object('path', "screenshot", 'fileId', NULL)
            ORDER BY "ordinality"
          ) AS "galleryImages"
        FROM "core"."applicationRegistration",
          unnest("screenshots") WITH ORDINALITY AS "unnested"("screenshot", "ordinality")
        GROUP BY "id"
      ) AS "screenshotEntries"
      WHERE "registration"."id" = "screenshotEntries"."id"
        AND "registration"."galleryImages" IS NULL`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
