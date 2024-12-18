import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropSubscriptionCustomerConstraint1734532875877
  implements MigrationInterface
{
  name = 'DropSubscriptionCustomerConstraint1734532875877';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP CONSTRAINT "FK_9120b7586c3471463480b58d20a"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD CONSTRAINT "FK_9120b7586c3471463480b58d20a" FOREIGN KEY ("stripeCustomerId") REFERENCES "core"."billingCustomer"("stripeCustomerId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
