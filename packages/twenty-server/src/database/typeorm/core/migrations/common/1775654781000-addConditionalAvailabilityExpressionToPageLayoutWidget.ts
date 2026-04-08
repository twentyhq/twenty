import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConditionalAvailabilityExpressionToPageLayoutWidget1775654781000
  implements MigrationInterface
{
  name = 'AddConditionalAvailabilityExpressionToPageLayoutWidget1775654781000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ADD "conditionalAvailabilityExpression" varchar`,
    );

    await queryRunner.query(
      `UPDATE "core"."pageLayoutWidget" SET "conditionalAvailabilityExpression" = 'device == "MOBILE"' WHERE "conditionalDisplay"::text = '{"and":[{"===":[{"var":"device"},"MOBILE"]}]}'`,
    );

    await queryRunner.query(
      `UPDATE "core"."pageLayoutWidget" SET "conditionalAvailabilityExpression" = 'device == "DESKTOP"' WHERE "conditionalDisplay"::text = '{"and":[{"===":[{"var":"device"},"DESKTOP"]}]}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" DROP COLUMN "conditionalAvailabilityExpression"`,
    );
  }
}
