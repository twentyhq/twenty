import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddIntegrationEntity1769186118820 implements MigrationInterface {
  name = 'AddIntegrationEntity1769186118820';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."integrations" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "whatsappBusinessAccountId" character varying, "whatsappWebhookToken" character varying, CONSTRAINT "UQ_c0f35b480e29a02a0d0eb5de2aa" UNIQUE ("whatsappBusinessAccountId"), CONSTRAINT "UQ_00514f0cf485832fc948ac3c592" UNIQUE ("whatsappWebhookToken"), CONSTRAINT "PK_9adcdc6d6f3922535361ce641e8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."integrations" ADD CONSTRAINT "FK_74b4a6216901cce047e144fc9af" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."integrations" DROP CONSTRAINT "FK_74b4a6216901cce047e144fc9af"`,
    );
    await queryRunner.query(`DROP TABLE "core"."integrations"`);
  }
}
