import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIntervalToBillingSubscription1710926613773
  implements MigrationInterface
{
  name = 'AddIntervalToBillingSubscription1710926613773';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD "interval" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN "interval"`,
    );
  }
}
