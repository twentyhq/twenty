import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddWorkspaceIdToPageLayoutTabAndPageLayoutWidget1756997911163
  implements MigrationInterface
{
  name = 'AddWorkspaceIdToPageLayoutTabAndPageLayoutWidget1756997911163';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_PAGE_LAYOUT_WIDGET_PAGE_LAYOUT_TAB_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_PAGE_LAYOUT_TAB_PAGE_LAYOUT_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ADD "workspaceId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" ADD "workspaceId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_PAGE_LAYOUT_WIDGET_WORKSPACE_ID_PAGE_LAYOUT_TAB_ID" ON "core"."pageLayoutWidget" ("workspaceId", "pageLayoutTabId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_PAGE_LAYOUT_TAB_WORKSPACE_ID_PAGE_LAYOUT_ID" ON "core"."pageLayoutTab" ("workspaceId", "pageLayoutId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ADD CONSTRAINT "FK_555948f84165dce1fe1f5f955ce" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" ADD CONSTRAINT "FK_2528e67c8c0c953d8303172989e" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" DROP CONSTRAINT "FK_2528e67c8c0c953d8303172989e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" DROP CONSTRAINT "FK_555948f84165dce1fe1f5f955ce"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_PAGE_LAYOUT_TAB_WORKSPACE_ID_PAGE_LAYOUT_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_PAGE_LAYOUT_WIDGET_WORKSPACE_ID_PAGE_LAYOUT_TAB_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" DROP COLUMN "workspaceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" DROP COLUMN "workspaceId"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_PAGE_LAYOUT_TAB_PAGE_LAYOUT_ID" ON "core"."pageLayoutTab" ("pageLayoutId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_PAGE_LAYOUT_WIDGET_PAGE_LAYOUT_TAB_ID" ON "core"."pageLayoutWidget" ("pageLayoutTabId") `,
    );
  }
}
