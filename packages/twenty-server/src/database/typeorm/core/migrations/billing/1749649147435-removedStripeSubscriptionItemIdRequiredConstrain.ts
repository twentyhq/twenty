import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovedStripeSubscriptionItemIdRequiredConstrain1749649147435
  implements MigrationInterface
{
  name = 'RemovedStripeSubscriptionItemIdRequiredConstrain1749649147435';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ALTER COLUMN "stripeSubscriptionItemId" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ALTER COLUMN "stripeSubscriptionItemId" SET NOT NULL`,
    );
  }
}
