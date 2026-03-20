import { type QueryRunner } from 'typeorm';

export const makeObjectPermissionUniversalIdentifierAndApplicationIdNotNullQueries =
  async (queryRunner: QueryRunner): Promise<void> => {
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_c5ea53618b32558fe24e495f21"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_c5ea53618b32558fe24e495f21" ON "core"."objectPermission" ("workspaceId", "universalIdentifier")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" ADD CONSTRAINT "FK_f2ecee1066fd43800dbc85f87e4" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  };
