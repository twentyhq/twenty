import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentProviderFieldForBillingSubscription1749480959443
  implements MigrationInterface
{
  name = 'AddPaymentProviderFieldForBillingSubscription1749480959443';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."billingSubscription_provider_enum" AS ENUM('stripe', 'inter')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD "provider" "core"."billingSubscription_provider_enum" NOT NULL DEFAULT 'stripe'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN "provider"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."billingSubscription_provider_enum"`,
    );
  }
}
