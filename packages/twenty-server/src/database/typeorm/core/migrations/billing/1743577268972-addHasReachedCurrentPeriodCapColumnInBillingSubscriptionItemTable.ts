import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHasReachedCurrentPeriodCapColumnInBillingSubscriptionItemTable1743577268972
  implements MigrationInterface
{
  name =
    'AddHasReachedCurrentPeriodCapColumnInBillingSubscriptionItemTable1743577268972';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ADD "hasReachedCurrentPeriodCap" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" DROP COLUMN "hasReachedCurrentPeriodCap"`,
    );
  }
}
