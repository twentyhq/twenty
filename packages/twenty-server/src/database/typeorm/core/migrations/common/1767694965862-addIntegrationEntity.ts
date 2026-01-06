import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddIntegrationEntity1767694965862 implements MigrationInterface {
  name = 'AddIntegrationEntity1767694965862';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."integration" ("whatsappBusinessAccountId" character varying, "workspaceId" uuid NOT NULL, "whatsappWebhookToken" character varying, CONSTRAINT "PK_a39552de8fedd4562a1c2d44bde" PRIMARY KEY ("workspaceId"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_eb9be7a05b891dcef696ea0c04" ON "core"."integration" ("whatsappBusinessAccountId", "workspaceId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_f8dc890322917a6f4b06fbffed" ON "core"."integration" ("whatsappWebhookToken") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."integration" ADD CONSTRAINT "FK_a39552de8fedd4562a1c2d44bde" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."integration" DROP CONSTRAINT "FK_a39552de8fedd4562a1c2d44bde"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_f8dc890322917a6f4b06fbffed"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_eb9be7a05b891dcef696ea0c04"`,
    );
    await queryRunner.query(`DROP TABLE "core"."integration"`);
  }
}
