import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.4.0', 1778235340020)
export class RenamePermissionFlagToPermissionFlagGrantFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" RENAME TO "permissionFlagGrant"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlagGrant" RENAME CONSTRAINT "IDX_PERMISSION_FLAG_FLAG_ROLE_ID_UNIQUE" TO "IDX_PERMISSION_FLAG_GRANT_FLAG_ROLE_ID_UNIQUE"`,
    );

    await queryRunner.query(
      `ALTER INDEX "core"."IDX_PERMISSION_FLAG_ROLE_ID" RENAME TO "IDX_PERMISSION_FLAG_GRANT_ROLE_ID"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_PERMISSION_FLAG_GRANT_ROLE_ID" RENAME TO "IDX_PERMISSION_FLAG_ROLE_ID"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlagGrant" RENAME CONSTRAINT "IDX_PERMISSION_FLAG_GRANT_FLAG_ROLE_ID_UNIQUE" TO "IDX_PERMISSION_FLAG_FLAG_ROLE_ID_UNIQUE"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlagGrant" RENAME TO "permissionFlag"`,
    );
  }
}
