import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddViewIndexes1756732238898 implements MigrationInterface {
  name = 'AddViewIndexes1756732238898';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FILTER_VIEW_ID" ON "core"."viewFilter" ("viewId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FILTER_GROUP_VIEW_ID" ON "core"."viewFilterGroup" ("viewId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_GROUP_VIEW_ID" ON "core"."viewGroup" ("viewId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_SORT_VIEW_ID" ON "core"."viewSort" ("viewId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FIELD_VIEW_ID" ON "core"."viewField" ("viewId") WHERE "deletedAt" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "core"."IDX_VIEW_FIELD_VIEW_ID"`);
    await queryRunner.query(`DROP INDEX "core"."IDX_VIEW_SORT_VIEW_ID"`);
    await queryRunner.query(`DROP INDEX "core"."IDX_VIEW_GROUP_VIEW_ID"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_FILTER_GROUP_VIEW_ID"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_VIEW_FILTER_VIEW_ID"`);
  }
}
