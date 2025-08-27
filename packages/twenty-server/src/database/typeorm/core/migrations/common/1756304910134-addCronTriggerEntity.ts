import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddCronTriggerEntity1756304910134 implements MigrationInterface {
  name = 'AddCronTriggerEntity1756304910134';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."triggerCron" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "settings" jsonb NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "serverlessFunctionId" uuid, CONSTRAINT "PK_78bdb64f8fcffbcc03fd947c514" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_WORKSPACE_ID" ON "core"."triggerCron" ("workspaceId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."triggerCron" ADD CONSTRAINT "FK_3a11c6382fc9a065f1929bc0c47" FOREIGN KEY ("serverlessFunctionId") REFERENCES "core"."serverlessFunction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."triggerCron" DROP CONSTRAINT "FK_3a11c6382fc9a065f1929bc0c47"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_WORKSPACE_ID"`);
    await queryRunner.query(`DROP TABLE "core"."triggerCron"`);
  }
}
