import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddUniversalIdentifierAndApplicationIdToWebhook1769200000000
  implements MigrationInterface
{
  name = 'AddUniversalIdentifierAndApplicationIdToWebhook1769200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" ADD "universalIdentifier" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `UPDATE "core"."webhook" SET "universalIdentifier" = "id"`,
    );
    await queryRunner.query(
      `UPDATE "core"."webhook" w SET "applicationId" = (
        SELECT a."id" FROM "core"."application" a
        WHERE a."workspaceId" = w."workspaceId"
        AND a."isCustom" = true
        LIMIT 1
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_WEBHOOK_WORKSPACE_ID_UNIVERSAL_IDENTIFIER" ON "core"."webhook" ("workspaceId", "universalIdentifier")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" ADD CONSTRAINT "FK_WEBHOOK_APPLICATION_ID" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" DROP CONSTRAINT "FK_WEBHOOK_APPLICATION_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_WEBHOOK_WORKSPACE_ID_UNIVERSAL_IDENTIFIER"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" DROP COLUMN "universalIdentifier"`,
    );
  }
}
