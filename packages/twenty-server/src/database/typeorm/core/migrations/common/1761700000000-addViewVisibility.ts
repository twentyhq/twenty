import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddViewVisibility1761700000000 implements MigrationInterface {
  name = 'AddViewVisibility1761700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ViewVisibility enum type
    await queryRunner.query(
      `CREATE TYPE "core"."view_visibility_enum" AS ENUM ('PRIVATE', 'SHARED_TO_ROLES', 'PUBLIC')`,
    );

    // Add visibility column to view table with default PUBLIC
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "visibility" "core"."view_visibility_enum" NOT NULL DEFAULT 'PUBLIC'`,
    );

    // Add createdById column to view table (nullable for backward compatibility)
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "createdById" uuid`,
    );

    // Create viewRole join table
    await queryRunner.query(
      `CREATE TABLE "core"."viewRole" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "viewId" uuid NOT NULL, "roleId" uuid NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IDX_VIEW_ROLE_VIEW_ID_ROLE_ID_UNIQUE" UNIQUE ("viewId", "roleId"), CONSTRAINT "PK_viewRole" PRIMARY KEY ("id"))`,
    );

    // Add indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_VISIBILITY" ON "core"."view" ("visibility")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_ROLE_WORKSPACE_ID" ON "core"."viewRole" ("workspaceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_ROLE_VIEW_ID" ON "core"."viewRole" ("viewId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_ROLE_ROLE_ID" ON "core"."viewRole" ("roleId")`,
    );

    // Add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_view_createdBy" FOREIGN KEY ("createdById") REFERENCES "core"."userWorkspace"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewRole" ADD CONSTRAINT "FK_viewRole_view" FOREIGN KEY ("viewId") REFERENCES "core"."view"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewRole" ADD CONSTRAINT "FK_viewRole_role" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "core"."viewRole" DROP CONSTRAINT "FK_viewRole_role"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewRole" DROP CONSTRAINT "FK_viewRole_view"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "FK_view_createdBy"`,
    );

    // Drop indexes
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_ROLE_ROLE_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_ROLE_VIEW_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_ROLE_WORKSPACE_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_VISIBILITY"`,
    );

    // Drop viewRole table
    await queryRunner.query(`DROP TABLE "core"."viewRole"`);

    // Drop columns from view table
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "createdById"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "visibility"`,
    );

    // Drop enum type
    await queryRunner.query(
      `DROP TYPE "core"."view_visibility_enum"`,
    );
  }
}

