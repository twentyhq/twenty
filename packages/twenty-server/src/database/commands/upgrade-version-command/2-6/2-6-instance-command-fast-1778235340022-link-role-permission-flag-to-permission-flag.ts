import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.6.0', 1778235340022)
export class LinkRolePermissionFlagToPermissionFlagFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag"
       ADD COLUMN IF NOT EXISTS "permissionFlagId" uuid`,
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
       DROP COLUMN IF EXISTS "permissionFlagId"`,
    );
  }
}
