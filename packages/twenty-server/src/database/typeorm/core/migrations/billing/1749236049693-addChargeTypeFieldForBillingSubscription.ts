import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChargeTypeFieldForBillingSubscription1749236049693
  implements MigrationInterface
{
  name = 'AddChargeTypeFieldForBillingSubscription1749236049693';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."billingSubscription_chargetype_enum" AS ENUM('one_time', 'per_seat', 'pre_paid')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD "chargeType" "core"."billingSubscription_chargetype_enum" DEFAULT 'one_time'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN "chargeType"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."billingSubscription_chargetype_enum"`,
    );
  }
}
