import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.19.0', 1783073776591, { type: 'slow' })
export class BackfillDisplayFieldsOnApplicationRegistrationSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."applicationRegistration"
       SET
         "description" = "manifest"->'application'->>'description',
         "author" = "manifest"->'application'->>'author',
         "category" = "manifest"->'application'->>'category',
         "websiteUrl" = "manifest"->'application'->>'websiteUrl',
         "aboutDescription" = "manifest"->'application'->>'aboutDescription',
         "termsUrl" = "manifest"->'application'->>'termsUrl',
         "emailSupport" = "manifest"->'application'->>'emailSupport',
         "issueReportUrl" = "manifest"->'application'->>'issueReportUrl',
         "screenshots" = COALESCE(ARRAY(SELECT jsonb_array_elements_text("manifest"->'application'->'screenshots')), '{}')
       WHERE "manifest" IS NOT NULL`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."applicationRegistration"
       SET
         "description" = NULL,
         "author" = NULL,
         "category" = NULL,
         "websiteUrl" = NULL,
         "aboutDescription" = NULL,
         "termsUrl" = NULL,
         "emailSupport" = NULL,
         "issueReportUrl" = NULL,
         "screenshots" = '{}'`,
    );
  }
}
