import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { PermissionFlagType } from 'twenty-shared/constants';
import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { STANDARD_PERMISSION_FLAG_DEFINITIONS } from 'src/engine/metadata-modules/permission-flag/constants/standard-permission-flag-definitions.constant';

const PERMISSION_FLAG_TYPES = Object.values(PermissionFlagType) as string[];

@RegisteredInstanceCommand('2.6.0', 1778235340023, { type: 'slow' })
export class BackfillRolePermissionFlagPermissionFlagIdSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    const unknownFlagRows: { flag: string }[] = await dataSource.query(
      `SELECT DISTINCT "flag" FROM "core"."rolePermissionFlag"
       WHERE "flag" <> ALL($1::varchar[])`,
      [PERMISSION_FLAG_TYPES],
    );

    if (unknownFlagRows.length > 0) {
      const unknownFlags = unknownFlagRows.map((row) => row.flag).join(', ');

      throw new Error(
        `Cannot migrate: rolePermissionFlag rows reference unknown flag value(s): ${unknownFlags}`,
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

    await dataSource.query(
      `UPDATE "core"."rolePermissionFlag" rolePermissionFlag
       SET "permissionFlagId" = permissionFlag."id"
       FROM "core"."permissionFlag" permissionFlag
       WHERE permissionFlag."workspaceId" = rolePermissionFlag."workspaceId"
       AND permissionFlag."key" = rolePermissionFlag."flag"
       AND rolePermissionFlag."permissionFlagId" IS NULL`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
