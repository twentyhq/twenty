import { type QueryRunner } from 'typeorm';

export const makePermissionFlagUniversalIdentifierAndApplicationIdNotNullQueries =
  async (queryRunner: QueryRunner): Promise<void> => {
    await queryRunner.query(`
      UPDATE "core"."permissionFlag" pf
      SET "applicationId" = (
        SELECT a.id FROM "core"."application" a
        WHERE a."workspaceId" = pf."workspaceId"
        LIMIT 1
      )
      WHERE pf."applicationId" IS NULL
    `);

    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_da8ffd3c24b4a819430a861067" ON "core"."permissionFlag" ("workspaceId", "universalIdentifier")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" ADD CONSTRAINT "FK_b26a9d39a88d0e72373c677c6c5" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  };
