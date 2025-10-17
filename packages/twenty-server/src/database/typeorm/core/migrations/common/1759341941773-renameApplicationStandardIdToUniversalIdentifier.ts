import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RenameApplicationStandardIdToUniversalIdentifier1759341941773
  implements MigrationInterface
{
  name = 'RenameApplicationStandardIdToUniversalIdentifier1759341941773';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_APPLICATION_STANDARD_ID_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" RENAME COLUMN "standardId" TO "universalIdentifier"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_APPLICATION_UNIVERSAL_IDENTIFIER_WORKSPACE_ID_UNIQUE" ON "core"."application" ("universalIdentifier", "workspaceId") WHERE "deletedAt" IS NULL AND "universalIdentifier" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_APPLICATION_UNIVERSAL_IDENTIFIER_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" RENAME COLUMN "universalIdentifier" TO "standardId"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_APPLICATION_STANDARD_ID_WORKSPACE_ID_UNIQUE" ON "core"."application" ("standardId", "workspaceId") WHERE (("deletedAt" IS NULL) AND ("standardId" IS NOT NULL))`,
    );
  }
}
