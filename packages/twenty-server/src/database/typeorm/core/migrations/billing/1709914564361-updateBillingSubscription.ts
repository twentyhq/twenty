import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateBillingSubscription1709914564361
  implements MigrationInterface
{
  name = 'UpdateBillingSubscription1709914564361';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP CONSTRAINT "FK_4abfb70314c18da69e1bee1954d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP CONSTRAINT "REL_4abfb70314c18da69e1bee1954"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP CONSTRAINT "UQ_9120b7586c3471463480b58d20a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD CONSTRAINT "FK_4abfb70314c18da69e1bee1954d" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP CONSTRAINT "FK_4abfb70314c18da69e1bee1954d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD CONSTRAINT "UQ_9120b7586c3471463480b58d20a" UNIQUE ("stripeCustomerId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD CONSTRAINT "REL_4abfb70314c18da69e1bee1954" UNIQUE ("workspaceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD CONSTRAINT "FK_4abfb70314c18da69e1bee1954d" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
