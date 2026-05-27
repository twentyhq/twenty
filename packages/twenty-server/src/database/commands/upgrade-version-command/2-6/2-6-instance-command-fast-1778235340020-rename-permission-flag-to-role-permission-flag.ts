import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.6.0', 1778235340020)
export class RenamePermissionFlagToRolePermissionFlagFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" RENAME TO "rolePermissionFlag"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag" DROP CONSTRAINT IF EXISTS "PK_a02789db60620a1e9f90147b50f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag" DROP CONSTRAINT IF EXISTS "PK_8c144a021030d7e3326835a04c8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag" ADD CONSTRAINT "PK_76591adc8035c2e7b0cd6115136" PRIMARY KEY ("id")`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag" RENAME CONSTRAINT "IDX_PERMISSION_FLAG_FLAG_ROLE_ID_UNIQUE" TO "IDX_ROLE_PERMISSION_FLAG_FLAG_ROLE_ID_UNIQUE"`,
    );

    await queryRunner.query(
      `ALTER INDEX "core"."IDX_PERMISSION_FLAG_ROLE_ID" RENAME TO "IDX_ROLE_PERMISSION_FLAG_ROLE_ID"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag" DROP CONSTRAINT "FK_13f8ca9c517976733a1ce4c10eb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag" DROP CONSTRAINT "FK_835bc9f7ef959debfc5cd268049"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag" DROP CONSTRAINT "FK_b26a9d39a88d0e72373c677c6c5"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_da8ffd3c24b4a819430a861067"`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e4559ae0dba56e53714137c704" ON "core"."rolePermissionFlag" ("workspaceId", "universalIdentifier")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag" ADD CONSTRAINT "FK_d47b1ebee75d98daa0c870c26e3" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag" ADD CONSTRAINT "FK_3835ecc1019327566d35728c8ba" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag" ADD CONSTRAINT "FK_4c6ea38698de230b0ec18fa2110" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag" DROP CONSTRAINT "FK_4c6ea38698de230b0ec18fa2110"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag" DROP CONSTRAINT "FK_3835ecc1019327566d35728c8ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag" DROP CONSTRAINT "FK_d47b1ebee75d98daa0c870c26e3"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_e4559ae0dba56e53714137c704"`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_da8ffd3c24b4a819430a861067" ON "core"."rolePermissionFlag" ("workspaceId", "universalIdentifier")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag" ADD CONSTRAINT "FK_b26a9d39a88d0e72373c677c6c5" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag" ADD CONSTRAINT "FK_835bc9f7ef959debfc5cd268049" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag" ADD CONSTRAINT "FK_13f8ca9c517976733a1ce4c10eb" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER INDEX "core"."IDX_ROLE_PERMISSION_FLAG_ROLE_ID" RENAME TO "IDX_PERMISSION_FLAG_ROLE_ID"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag" RENAME CONSTRAINT "IDX_ROLE_PERMISSION_FLAG_FLAG_ROLE_ID_UNIQUE" TO "IDX_PERMISSION_FLAG_FLAG_ROLE_ID_UNIQUE"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag" DROP CONSTRAINT IF EXISTS "PK_76591adc8035c2e7b0cd6115136"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag" ADD CONSTRAINT "PK_a02789db60620a1e9f90147b50f" PRIMARY KEY ("id")`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."rolePermissionFlag" RENAME TO "permissionFlag"`,
    );
  }
}
