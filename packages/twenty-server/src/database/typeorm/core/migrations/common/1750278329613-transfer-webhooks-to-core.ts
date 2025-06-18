import { MigrationInterface, QueryRunner } from 'typeorm';

export class TransferWebhooksToCore1750278329613 implements MigrationInterface {
  name = 'TransferWebhooksToCore1750278329613';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."webhook" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "targetUrl" character varying NOT NULL, "operations" text array NOT NULL DEFAULT '{*.*}', "description" character varying, "secret" character varying NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_e6765510c2d078db49632b59020" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_WEBHOOK_WORKSPACE_ID" ON "core"."webhook" ("workspaceId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" ADD CONSTRAINT "FK_597ab5e7de76f1836b8fd80d6b9" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" DROP CONSTRAINT "FK_597ab5e7de76f1836b8fd80d6b9"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_WEBHOOK_WORKSPACE_ID"`);
    await queryRunner.query(`DROP TABLE "core"."webhook"`);
  }
}
