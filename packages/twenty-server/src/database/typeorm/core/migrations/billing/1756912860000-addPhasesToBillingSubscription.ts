import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddPhasesToBillingSubscription1756912860000
  implements MigrationInterface
{
  name = 'AddPhasesToBillingSubscription1756912860000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD "phases" jsonb NOT NULL DEFAULT '[]'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN "phases"`,
    );
  }
}
