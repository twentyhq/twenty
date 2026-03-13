import { type QueryRunner } from 'typeorm';

export const makePermissionFlagUniversalIdentifierAndApplicationIdNotNullQueries =
  async (queryRunner: QueryRunner): Promise<void> => {
    await queryRunner.query(`
      UPDATE "core"."permissionFlag" pf
      SET "applicationId" = (
        SELECT r."applicationId" FROM "core"."role" r
        WHERE r.id = pf."roleId"
      )
      WHERE pf."applicationId" IS NULL
    `);

    await queryRunner.query(`
      DELETE FROM "core"."permissionFlag"
      WHERE "applicationId" IS NULL
    `);

    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_da8ffd3c24b4a819430a861067"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_da8ffd3c24b4a819430a861067" ON "core"."permissionFlag" ("workspaceId", "universalIdentifier")`,
    );
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'FK_b26a9d39a88d0e72373c677c6c5'
            AND conrelid = '"core"."permissionFlag"'::regclass
        ) THEN
          ALTER TABLE "core"."permissionFlag" ADD CONSTRAINT "FK_b26a9d39a88d0e72373c677c6c5" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END $$`);
  };
