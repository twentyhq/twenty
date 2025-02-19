import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubscriptionStatusOnWorkspace1702479005171
  implements MigrationInterface
{
  name = 'AddSubscriptionStatusOnWorkspace1702479005171';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "subscriptionStatus" character varying NOT NULL DEFAULT 'incomplete'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "subscriptionStatus"`,
    );
  }
}
