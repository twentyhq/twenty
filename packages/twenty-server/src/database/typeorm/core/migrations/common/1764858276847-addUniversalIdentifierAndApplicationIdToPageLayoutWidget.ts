import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddUniversalIdentifierAndApplicationIdToPageLayoutWidget1764858276847
  implements MigrationInterface
{
  name =
    'AddUniversalIdentifierAndApplicationIdToPageLayoutWidget1764858276847';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add columns as nullable first
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ADD "universalIdentifier" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ADD "applicationId" uuid`,
    );

    // Populate existing rows with universalIdentifier and applicationId
    await queryRunner.query(
      `UPDATE "core"."pageLayoutWidget"
       SET "universalIdentifier" = gen_random_uuid(),
           "applicationId" = (
             SELECT "workspaceCustomApplicationId"
             FROM "core"."workspace"
             WHERE "workspace"."id" = "pageLayoutWidget"."workspaceId"
           )
       WHERE "universalIdentifier" IS NULL OR "applicationId" IS NULL`,
    );

    // Add NOT NULL constraints
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "applicationId" SET NOT NULL`,
    );

    // Add unique index and foreign key
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_PAGE_LAYOUT_WIDGET_WORKSPACE_UNIVERSAL_ID" ON "core"."pageLayoutWidget" ("workspaceId", "universalIdentifier")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ADD CONSTRAINT "FK_PAGE_LAYOUT_WIDGET_APPLICATION" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" DROP CONSTRAINT "FK_PAGE_LAYOUT_WIDGET_APPLICATION"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_PAGE_LAYOUT_WIDGET_WORKSPACE_UNIVERSAL_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" DROP COLUMN "universalIdentifier"`,
    );
  }
}
