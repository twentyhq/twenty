import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBillingEntitlementTable1732098580545
  implements MigrationInterface
{
  name = 'AddBillingEntitlementTable1732098580545';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."billingEntitlement" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" text NOT NULL, "workspaceId" uuid NOT NULL, "stripeCustomerId" character varying NOT NULL, "value" boolean NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "IndexOnFeatureKeyAndWorkspaceIdUnique" UNIQUE ("key", "workspaceId"), CONSTRAINT "PK_4e6ed788c3ca0bf6610d5022576" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."billingEntitlement" ADD CONSTRAINT "FK_599121a93d8177b5d713b941982" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingEntitlement" DROP CONSTRAINT "FK_599121a93d8177b5d713b941982"`,
    );

    await queryRunner.query(`DROP TABLE "core"."billingEntitlement"`);
  }
}
