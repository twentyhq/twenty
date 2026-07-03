import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.19.0', 1783073776590)
export class AddDisplayFieldsToApplicationRegistrationFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" ADD COLUMN IF NOT EXISTS "description" text',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" ADD COLUMN IF NOT EXISTS "author" text',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" ADD COLUMN IF NOT EXISTS "category" text',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" ADD COLUMN IF NOT EXISTS "websiteUrl" text',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" ADD COLUMN IF NOT EXISTS "aboutDescription" text',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" ADD COLUMN IF NOT EXISTS "termsUrl" text',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" ADD COLUMN IF NOT EXISTS "emailSupport" text',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" ADD COLUMN IF NOT EXISTS "issueReportUrl" text',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD COLUMN IF NOT EXISTS "screenshots" text array NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" DROP COLUMN "description"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" DROP COLUMN "author"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" DROP COLUMN "category"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" DROP COLUMN "websiteUrl"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" DROP COLUMN "aboutDescription"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" DROP COLUMN "termsUrl"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" DROP COLUMN "emailSupport"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" DROP COLUMN "issueReportUrl"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" DROP COLUMN "screenshots"',
    );
  }
}
