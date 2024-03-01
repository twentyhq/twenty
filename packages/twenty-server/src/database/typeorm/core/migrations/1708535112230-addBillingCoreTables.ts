import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBillingCoreTables1708535112230 implements MigrationInterface {
  name = 'AddBillingCoreTables1708535112230';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."billingSubscriptionItem" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deletedAt" TIMESTAMP, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "billingSubscriptionId" uuid NOT NULL, "stripeProductId" character varying NOT NULL, "stripePriceId" character varying NOT NULL, "quantity" integer NOT NULL, CONSTRAINT "PK_0287b2d9fca488edcbf748281fc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."billingSubscription" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deletedAt" TIMESTAMP, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "workspaceId" uuid NOT NULL, "stripeCustomerId" character varying NOT NULL, "stripeSubscriptionId" character varying NOT NULL, "status" character varying NOT NULL, CONSTRAINT "UQ_9120b7586c3471463480b58d20a" UNIQUE ("stripeCustomerId"), CONSTRAINT "UQ_1a858c28c7766d429cbd25f05e8" UNIQUE ("stripeSubscriptionId"), CONSTRAINT "REL_4abfb70314c18da69e1bee1954" UNIQUE ("workspaceId"), CONSTRAINT "PK_6e9c72c32d91640b8087cb53666" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ADD CONSTRAINT "FK_a602e7c9da619b8290232f6eeab" FOREIGN KEY ("billingSubscriptionId") REFERENCES "core"."billingSubscription"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
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
      `ALTER TABLE "core"."billingSubscriptionItem" DROP CONSTRAINT "FK_a602e7c9da619b8290232f6eeab"`,
    );
    await queryRunner.query(`DROP TABLE "core"."billingSubscription"`);
    await queryRunner.query(`DROP TABLE "core"."billingSubscriptionItem"`);
  }
}
