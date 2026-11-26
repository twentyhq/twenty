import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.65.0', 1795703218960)
export class DropViewVisibilityFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP COLUMN IF EXISTS "visibility"',
    );
    await queryRunner.query('DROP TYPE IF EXISTS "core"."view_visibility_enum"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TYPE "core"."view_visibility_enum" AS ENUM(\'WORKSPACE\', \'UNLISTED\')',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD COLUMN IF NOT EXISTS "visibility" "core"."view_visibility_enum"',
    );
    await queryRunner.query(
      'UPDATE "core"."view" SET "visibility" = CASE WHEN "isPrivate" THEN \'UNLISTED\'::"core"."view_visibility_enum" ELSE \'WORKSPACE\'::"core"."view_visibility_enum" END WHERE "visibility" IS NULL',
    );
  }
}
