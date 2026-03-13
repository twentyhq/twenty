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
        SELECT r."applicationId" FROM "core"."role" r
        WHERE r.id = pf."roleId"
      )
      WHERE pf."applicationId" IS NULL
    `);
  };
