import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';
import { STANDARD_PERMISSION_FLAG_DEFINITIONS } from 'src/engine/metadata-modules/permission-flag/constants/standard-permission-flag-definitions.constant';
import { TOOL_PERMISSION_FLAGS } from 'src/engine/metadata-modules/permissions/constants/tool-permission-flags';

const sqlString = (value: string) => value.replace(/'/g, "''");

const standardPermissionFlagValues = STANDARD_PERMISSION_FLAG_DEFINITIONS.map(
  (definition) =>
    `('${definition.universalIdentifier}'::uuid, '${sqlString(definition.key)}', '${sqlString(definition.label)}', ${
      definition.description === null
        ? 'NULL'
        : `'${sqlString(definition.description)}'`
    }, ${
      definition.icon === null
        ? 'NULL'
        : `'${sqlString(definition.icon)}'`
    }, '${definition.permissionType}')`,
).join(', ');

const toolPermissionFlagKeys = TOOL_PERMISSION_FLAGS.map(
  (flag) => `'${sqlString(flag)}'`,
).join(', ');

@RegisteredInstanceCommand('2.6.0', 1778235340022)
export class BackfillRolePermissionFlagPermissionFlagIdFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$
       BEGIN
         IF EXISTS (
           SELECT 1
           FROM "core"."rolePermissionFlag"
           WHERE "flag" IS NULL
         ) THEN
           RAISE EXCEPTION 'Cannot migrate: rolePermissionFlag rows with NULL flag detected';
         END IF;
       END $$`,
    );

    await queryRunner.query(
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
        standardPermissionFlag."universalIdentifier",
        standardPermissionFlag."key",
        standardPermissionFlag."label",
        standardPermissionFlag."description",
        standardPermissionFlag."icon",
        standardPermissionFlag."permissionType",
        now(),
        now()
      FROM "core"."workspace" workspace
      INNER JOIN "core"."application" standardApplication
        ON standardApplication."workspaceId" = workspace."id"
        AND standardApplication."universalIdentifier" = '${TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER}'
        AND standardApplication."deletedAt" IS NULL
      CROSS JOIN (
        VALUES ${standardPermissionFlagValues}
      ) AS standardPermissionFlag(
        "universalIdentifier",
        "key",
        "label",
        "description",
        "icon",
        "permissionType"
      )
      ON CONFLICT ("key", "workspaceId") DO NOTHING`,
    );

    await queryRunner.query(
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
        rolePermissionFlag."workspaceId",
        standardApplication."id",
        uuid_generate_v5(
          '${TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER}'::uuid,
          rolePermissionFlag."flag"
        ),
        rolePermissionFlag."flag",
        rolePermissionFlag."flag",
        NULL,
        NULL,
        CASE
          WHEN rolePermissionFlag."flag" IN (${toolPermissionFlagKeys})
            THEN 'tool'
          ELSE 'settings'
        END,
        now(),
        now()
      FROM (
        SELECT DISTINCT "workspaceId", "flag"
        FROM "core"."rolePermissionFlag"
      ) rolePermissionFlag
      INNER JOIN "core"."application" standardApplication
        ON standardApplication."workspaceId" = rolePermissionFlag."workspaceId"
        AND standardApplication."universalIdentifier" = '${TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER}'
        AND standardApplication."deletedAt" IS NULL
      LEFT JOIN "core"."permissionFlag" existingPermissionFlag
        ON existingPermissionFlag."workspaceId" = rolePermissionFlag."workspaceId"
        AND existingPermissionFlag."key" = rolePermissionFlag."flag"
      WHERE existingPermissionFlag."id" IS NULL
      ON CONFLICT ("key", "workspaceId") DO NOTHING`,
    );

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
