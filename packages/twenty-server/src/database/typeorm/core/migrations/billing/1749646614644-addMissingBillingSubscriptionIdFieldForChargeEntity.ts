import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingBillingSubscriptionIdFieldForChargeEntity1749646614644
  implements MigrationInterface
{
  name = 'AddMissingBillingSubscriptionIdFieldForChargeEntity1749646614644';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingCharge" DROP CONSTRAINT "FK_cf324476a838a4b462ff56a55a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCharge" ADD CONSTRAINT "UQ_cf324476a838a4b462ff56a55a8" UNIQUE ("billingSubscriptionId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCharge" ADD CONSTRAINT "FK_cf324476a838a4b462ff56a55a8" FOREIGN KEY ("billingSubscriptionId") REFERENCES "core"."billingSubscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingCharge" DROP CONSTRAINT "FK_cf324476a838a4b462ff56a55a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCharge" DROP CONSTRAINT "UQ_cf324476a838a4b462ff56a55a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCharge" ADD CONSTRAINT "FK_cf324476a838a4b462ff56a55a8" FOREIGN KEY ("billingSubscriptionId") REFERENCES "core"."billingSubscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
