import { type MigrationInterface, type QueryRunner } from 'typeorm';

import { ADMIN_ROLE } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/roles/admin-role';

export class AddStandardIdToRole1754480368129 implements MigrationInterface {
  name = 'AddStandardIdToRole1754480368129';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."role" ADD "standardId" uuid`);

    await queryRunner.query(
      `UPDATE "core"."role" SET "standardId" = '${ADMIN_ROLE.standardId}' WHERE "label" = 'Admin'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "core"."role" SET "standardId" = NULL`);

    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP COLUMN "standardId"`,
    );
  }
}
