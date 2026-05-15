import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { PermissionFlagType } from 'twenty-shared/constants';
import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { STANDARD_PERMISSION_FLAG_DEFINITIONS } from 'src/engine/metadata-modules/permission-flag/constants/standard-permission-flag-definitions.constant';

const PERMISSION_FLAG_TYPES = Object.values(PermissionFlagType) as string[];

@RegisteredInstanceCommand('2.6.0', 1778235340022, { type: 'slow' })
export class BackfillRolePermissionFlagPermissionFlagIdSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    const [{ count: nullFlagCount }] = await dataSource.query(
      `SELECT count(*)::int AS count FROM "core"."rolePermissionFlag" WHERE "flag" IS NULL`,
    );

    if (nullFlagCount > 0) {
      throw new Error(
        `Cannot migrate: ${nullFlagCount} rolePermissionFlag row(s) with NULL flag detected`,
      );
    }

    const unknownFlagRows: { flag: string }[] = await dataSource.query(
      `SELECT DISTINCT "flag" FROM "core"."rolePermissionFlag" WHERE "flag" <> ALL($1::varchar[])`,
      [PERMISSION_FLAG_TYPES],
    );

    if (unknownFlagRows.length > 0) {
      const unknownFlags = unknownFlagRows.map((row) => row.flag).join(', ');

      throw new Error(
        `Cannot migrate: rolePermissionFlag rows reference unknown flag(s): ${unknownFlags}`,
      );
    }

    for (const definition of STANDARD_PERMISSION_FLAG_DEFINITIONS) {
      await dataSource.query(
        `INSERT INTO "core"."permissionFlag" (
          "id",
          "workspaceId",
          "applicationId",
          "universalIdentifier",
          "key",
          "label",
          "description",
          "icon",
          "permissionType",
          "createdAt",
          "updatedAt"
        )
        SELECT
          uuid_generate_v4(),
          workspace."id",
          standardApplication."id",
          $1::uuid,
          $2,
          $3,
          $4,
          $5,
          $6,
          now(),
          now()
        FROM "core"."workspace" workspace
        INNER JOIN "core"."application" standardApplication
          ON standardApplication."workspaceId" = workspace."id"
          AND standardApplication."universalIdentifier" = $7
          AND standardApplication."deletedAt" IS NULL
        ON CONFLICT ("key", "workspaceId") DO NOTHING`,
        [
          definition.universalIdentifier,
          definition.key,
          definition.label,
          definition.description,
          definition.icon,
          definition.permissionType,
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        ],
      );
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag"
       ADD COLUMN IF NOT EXISTS "permissionFlagId" uuid`,
    );

    await queryRunner.query(
      `UPDATE "core"."rolePermissionFlag" rolePermissionFlag
       SET "permissionFlagId" = permissionFlag."id"
       FROM "core"."permissionFlag" permissionFlag
       WHERE permissionFlag."workspaceId" = rolePermissionFlag."workspaceId"
       AND permissionFlag."key" = rolePermissionFlag."flag"
       AND rolePermissionFlag."permissionFlagId" IS NULL`,
    );

    await queryRunner.query(
      `DO $$
       BEGIN
         IF EXISTS (
           SELECT 1
           FROM "core"."rolePermissionFlag"
           WHERE "permissionFlagId" IS NULL
         ) THEN
           RAISE EXCEPTION 'Unable to backfill rolePermissionFlag.permissionFlagId';
         END IF;
       END $$`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag"
       DROP CONSTRAINT IF EXISTS "IDX_ROLE_PERMISSION_FLAG_FLAG_ROLE_ID_UNIQUE"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag"
       ALTER COLUMN "permissionFlagId" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag" DROP COLUMN "flag"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag"
       ADD CONSTRAINT "IDX_ROLE_PERMISSION_FLAG_PERMISSION_FLAG_ID_ROLE_ID_UNIQUE"
       UNIQUE ("permissionFlagId", "roleId")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_ROLE_PERMISSION_FLAG_PERMISSION_FLAG_ID"
       ON "core"."rolePermissionFlag" ("permissionFlagId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag"
       ADD CONSTRAINT "FK_8724e63323f1331591a3e91b0b3"
       FOREIGN KEY ("permissionFlagId") REFERENCES "core"."permissionFlag"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag"
       DROP CONSTRAINT IF EXISTS "FK_8724e63323f1331591a3e91b0b3"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_ROLE_PERMISSION_FLAG_PERMISSION_FLAG_ID"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag"
       DROP CONSTRAINT IF EXISTS "IDX_ROLE_PERMISSION_FLAG_PERMISSION_FLAG_ID_ROLE_ID_UNIQUE"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag"
       ADD COLUMN IF NOT EXISTS "flag" varchar`,
    );

    await queryRunner.query(
      `UPDATE "core"."rolePermissionFlag" rolePermissionFlag
       SET "flag" = permissionFlag."key"
       FROM "core"."permissionFlag" permissionFlag
       WHERE permissionFlag."id" = rolePermissionFlag."permissionFlagId"
       AND rolePermissionFlag."flag" IS NULL`,
    );

    await queryRunner.query(
      `DO $$
       BEGIN
         IF EXISTS (
           SELECT 1
           FROM "core"."rolePermissionFlag"
           WHERE "flag" IS NULL
         ) THEN
           RAISE EXCEPTION 'Unable to restore rolePermissionFlag.flag';
         END IF;
       END $$`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag"
       ALTER COLUMN "flag" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag"
       ADD CONSTRAINT "IDX_ROLE_PERMISSION_FLAG_FLAG_ROLE_ID_UNIQUE"
       UNIQUE ("flag", "roleId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag"
       DROP COLUMN IF EXISTS "permissionFlagId"`,
    );
  }
}
