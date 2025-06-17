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
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ALTER COLUMN "deletedAt" TYPE TIMESTAMP WITH TIME ZONE USING "deletedAt" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ALTER COLUMN "status" TYPE text`,
    );
    // TODO: The 'expired' status was inserted here manualy. After added and generated migration, the migration generated was not working properly, might be related to this issue https://stackoverflow.com/questions/76668441/get-operator-does-not-exist-when-update-an-enum-in-postgresql but we currently have no time to further investigate a proper solution.
    await queryRunner.query(
      `CREATE TYPE "core"."billingSubscription_status_enum" AS ENUM('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'paused', 'trialing', 'unpaid', 'expired')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ALTER COLUMN "status" TYPE "core"."billingSubscription_status_enum" USING "status"::"core"."billingSubscription_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ALTER COLUMN "status" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ALTER COLUMN "status" DROP NOT NULL`,
    );
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
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ALTER COLUMN "status" TYPE text`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."billingSubscription_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ALTER COLUMN "status" TYPE character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ALTER COLUMN "deletedAt" TYPE TIMESTAMP`,
    );
  }
}
