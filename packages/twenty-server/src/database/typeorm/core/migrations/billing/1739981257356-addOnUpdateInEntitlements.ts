import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOnUpdateInEntitlements1739981257356
  implements MigrationInterface
{
  name = 'AddOnUpdateInEntitlements1739981257356';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingEntitlement" DROP CONSTRAINT "FK_766a1918aa3dbe0d67d3df62356"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingEntitlement" ADD CONSTRAINT "FK_766a1918aa3dbe0d67d3df62356" FOREIGN KEY ("stripeCustomerId") REFERENCES "core"."billingCustomer"("stripeCustomerId") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingEntitlement" DROP CONSTRAINT "FK_766a1918aa3dbe0d67d3df62356"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingEntitlement" ADD CONSTRAINT "FK_766a1918aa3dbe0d67d3df62356" FOREIGN KEY ("stripeCustomerId") REFERENCES "core"."billingCustomer"("stripeCustomerId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
