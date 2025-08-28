import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddCronTriggerEntity1756373902817 implements MigrationInterface {
  name = 'AddCronTriggerEntity1756373902817';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."cronTrigger" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "settings" jsonb NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "serverlessFunctionId" uuid, CONSTRAINT "PK_153e054abdb2663942d4661e3bb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_CRON_TRIGGER_WORKSPACE_ID" ON "core"."cronTrigger" ("workspaceId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" ADD CONSTRAINT "FK_f70831ec336e0cb42d6a33b80ba" FOREIGN KEY ("serverlessFunctionId") REFERENCES "core"."serverlessFunction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" DROP CONSTRAINT "FK_f70831ec336e0cb42d6a33b80ba"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_CRON_TRIGGER_WORKSPACE_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."cronTrigger"`);
  }
}
