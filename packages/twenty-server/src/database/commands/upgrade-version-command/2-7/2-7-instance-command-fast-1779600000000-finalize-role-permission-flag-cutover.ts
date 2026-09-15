import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.7.0', 1779600000000)
export class FinalizeRolePermissionFlagCutoverFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
       ALTER COLUMN "permissionFlagId" DROP NOT NULL`,
    );
  }
}
