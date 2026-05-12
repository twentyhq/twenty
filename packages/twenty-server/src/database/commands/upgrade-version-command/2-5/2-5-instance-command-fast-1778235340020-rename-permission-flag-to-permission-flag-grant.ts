import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.5.0', 1778235340020)
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

    // Re-hash inherited constraints/indexes so TypeORM's schema diff matches
    // the renamed table. Original names were derived from "permissionFlag"
    // and stay free for the new catalog table created by the next migration.
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlagGrant" DROP CONSTRAINT "FK_13f8ca9c517976733a1ce4c10eb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlagGrant" DROP CONSTRAINT "FK_835bc9f7ef959debfc5cd268049"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlagGrant" DROP CONSTRAINT "FK_b26a9d39a88d0e72373c677c6c5"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_da8ffd3c24b4a819430a861067"`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_49d4aa416a11933e35263390ad" ON "core"."permissionFlagGrant" ("workspaceId", "universalIdentifier")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlagGrant" ADD CONSTRAINT "FK_272c63f634c6b9364c8ab0e94c9" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlagGrant" ADD CONSTRAINT "FK_6090c1bb1c94b4e7260acb4d435" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlagGrant" ADD CONSTRAINT "FK_d19956ecbc979cf2e67df6fbd50" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlagGrant" DROP CONSTRAINT "FK_d19956ecbc979cf2e67df6fbd50"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlagGrant" DROP CONSTRAINT "FK_6090c1bb1c94b4e7260acb4d435"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlagGrant" DROP CONSTRAINT "FK_272c63f634c6b9364c8ab0e94c9"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_49d4aa416a11933e35263390ad"`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_da8ffd3c24b4a819430a861067" ON "core"."permissionFlagGrant" ("workspaceId", "universalIdentifier")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlagGrant" ADD CONSTRAINT "FK_b26a9d39a88d0e72373c677c6c5" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlagGrant" ADD CONSTRAINT "FK_835bc9f7ef959debfc5cd268049" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlagGrant" ADD CONSTRAINT "FK_13f8ca9c517976733a1ce4c10eb" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

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
