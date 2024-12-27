import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveSubscriptionStatusFromCoreWorkspace1719494707738
  implements MigrationInterface
{
  name = 'RemoveSubscriptionStatusFromCoreWorkspace1719494707738';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "subscriptionStatus"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."workspace_subscriptionstatus_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."workspace_subscriptionstatus_enum" AS ENUM('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'paused', 'trialing', 'unpaid')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "subscriptionStatus" "core"."workspace_subscriptionstatus_enum" NOT NULL DEFAULT 'incomplete'`,
    );
  }
}
