import { type QueryRunner } from 'typeorm';

export const addPermissionFlagUniversalIdentifierAndApplicationIdColumns =
  async (queryRunner: QueryRunner): Promise<void> => {
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" ADD "universalIdentifier" uuid DEFAULT gen_random_uuid()`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" ADD "applicationId" uuid`,
    );
    await queryRunner.query(`
      UPDATE "core"."permissionFlag" pf
      SET "applicationId" = (
        SELECT a.id FROM "core"."application" a
        WHERE a."workspaceId" = pf."workspaceId"
        LIMIT 1
      )
      WHERE pf."applicationId" IS NULL
    `);
  };
