import { MigrationInterface, QueryRunner } from 'typeorm';

export class UseEnumForSubscriptionStatusInterval1719327438923
  implements MigrationInterface
{
  name = 'UseEnumForSubscriptionStatusInterval1719327438923';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."workspace_subscriptionstatus_enum" AS ENUM('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'paused', 'trialing', 'unpaid')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "subscriptionStatus" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "subscriptionStatus" TYPE "core"."workspace_subscriptionstatus_enum" USING "subscriptionStatus"::"core"."workspace_subscriptionstatus_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "subscriptionStatus" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "subscriptionStatus" SET DEFAULT 'incomplete'::"core"."workspace_subscriptionstatus_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "subscriptionStatus" TYPE text`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."workspace_subscriptionstatus_enum"`,
    );
  }
}
