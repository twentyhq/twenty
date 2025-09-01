import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddDatabaseEventTriggerEntity1756385539610
  implements MigrationInterface
{
  name = 'AddDatabaseEventTriggerEntity1756385539610';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."databaseEventTrigger" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "settings" jsonb NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "serverlessFunctionId" uuid, CONSTRAINT "PK_b3e1ceba9d36f8b5aac6342a267" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_DATABASE_EVENT_TRIGGER_WORKSPACE_ID" ON "core"."databaseEventTrigger" ("workspaceId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" ADD CONSTRAINT "FK_fe492f1ecc81621b6d7cee1775b" FOREIGN KEY ("serverlessFunctionId") REFERENCES "core"."serverlessFunction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" DROP CONSTRAINT "FK_fe492f1ecc81621b6d7cee1775b"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_DATABASE_EVENT_TRIGGER_WORKSPACE_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."databaseEventTrigger"`);
  }
}
