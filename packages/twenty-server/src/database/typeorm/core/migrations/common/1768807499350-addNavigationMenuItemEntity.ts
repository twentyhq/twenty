import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddNavigationMenuItemEntity1768807499350
  implements MigrationInterface
{
  name = 'AddNavigationMenuItemEntity1768807499350';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."navigationMenuItem" ("workspaceId" uuid NOT NULL, "universalIdentifier" uuid NOT NULL, "applicationId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userWorkspaceId" uuid, "targetRecordId" uuid NOT NULL, "targetObjectMetadataId" uuid NOT NULL, "folderId" uuid, "position" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d8689756f55769faea7dc0ae968" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4d8beaebdfcd5d82ebe6e8b58f" ON "core"."navigationMenuItem" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_NAVIGATION_MENU_ITEM_FOLDER_ID_WORKSPACE_ID" ON "core"."navigationMenuItem" ("folderId", "workspaceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_NAVIGATION_MENU_ITEM_TARGET_RECORD_OBJ_METADATA_WS_ID" ON "core"."navigationMenuItem" ("targetRecordId", "targetObjectMetadataId", "workspaceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_NAVIGATION_MENU_ITEM_USER_WORKSPACE_ID_WORKSPACE_ID" ON "core"."navigationMenuItem" ("userWorkspaceId", "workspaceId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD CONSTRAINT "FK_03c63a0b00ddc3ade21ed0b1a80" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD CONSTRAINT "FK_6fd84a774fe4ea4daa9aeeee5ed" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD CONSTRAINT "FK_b2e02050a5faa58ed3e08624659" FOREIGN KEY ("userWorkspaceId") REFERENCES "core"."userWorkspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD CONSTRAINT "FK_62d47d14b50b67a03f832481de7" FOREIGN KEY ("targetObjectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT "FK_62d47d14b50b67a03f832481de7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT "FK_b2e02050a5faa58ed3e08624659"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT "FK_6fd84a774fe4ea4daa9aeeee5ed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT "FK_03c63a0b00ddc3ade21ed0b1a80"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_NAVIGATION_MENU_ITEM_USER_WORKSPACE_ID_WORKSPACE_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_NAVIGATION_MENU_ITEM_TARGET_RECORD_OBJ_METADATA_WS_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_NAVIGATION_MENU_ITEM_FOLDER_ID_WORKSPACE_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_4d8beaebdfcd5d82ebe6e8b58f"`,
    );
    await queryRunner.query(`DROP TABLE "core"."navigationMenuItem"`);
  }
}
