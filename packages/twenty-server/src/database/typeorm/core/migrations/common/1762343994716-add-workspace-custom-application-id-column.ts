import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddWorkspaceCustomApplicationIdColumn1762343994716
  implements MigrationInterface
{
  name = 'AddWorkspaceCustomApplicationIdColumn1762343994716';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "workspaceCustomApplicationId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_APPLICATION_UNIVERSAL_IDENTIFIER_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_APPLICATION_UNIVERSAL_IDENTIFIER_WORKSPACE_ID_UNIQUE" ON "core"."application" ("universalIdentifier", "workspaceId") WHERE "deletedAt" IS NULL AND "universalIdentifier" IS NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD CONSTRAINT "FK_workspace_workspaceCustomApplicationId" FOREIGN KEY ("workspaceCustomApplicationId") REFERENCES "core"."application"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP CONSTRAINT IF EXISTS "FK_workspace_workspaceCustomApplicationId"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_APPLICATION_UNIVERSAL_IDENTIFIER_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ALTER COLUMN "universalIdentifier" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_APPLICATION_UNIVERSAL_IDENTIFIER_WORKSPACE_ID_UNIQUE" ON "core"."application" ("universalIdentifier", "workspaceId") WHERE (("deletedAt" IS NULL) AND ("universalIdentifier" IS NOT NULL"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "workspaceCustomApplicationId"`,
    );
  }
}
