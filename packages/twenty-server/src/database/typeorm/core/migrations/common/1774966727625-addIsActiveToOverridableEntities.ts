import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveToOverridableEntities1774966727625
  implements MigrationInterface
{
  name = 'AddIsActiveToOverridableEntities1774966727625';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewFieldGroup" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );

    await queryRunner.query(
      `UPDATE "core"."viewFieldGroup" SET "isActive" = false WHERE "deletedAt" IS NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "core"."viewField" SET "isActive" = false WHERE "deletedAt" IS NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "core"."pageLayoutTab" SET "isActive" = false WHERE "deletedAt" IS NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "core"."pageLayoutWidget" SET "isActive" = false WHERE "deletedAt" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" DROP COLUMN "isActive"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" DROP COLUMN "isActive"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" DROP COLUMN "isActive"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFieldGroup" DROP COLUMN "isActive"`,
    );
  }
}
