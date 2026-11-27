import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.64.0', 1795618787744)
export class RelaxViewVisibilityFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "core"."IDX_VIEW_VISIBILITY"');
    await queryRunner.query(
      'ALTER TABLE "core"."view" ALTER COLUMN "visibility" DROP DEFAULT, ALTER COLUMN "visibility" DROP NOT NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'UPDATE "core"."view" SET "visibility" = CASE WHEN "isPrivate" THEN \'UNLISTED\'::"core"."view_visibility_enum" ELSE \'WORKSPACE\'::"core"."view_visibility_enum" END WHERE "visibility" IS NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ALTER COLUMN "visibility" SET DEFAULT \'WORKSPACE\', ALTER COLUMN "visibility" SET NOT NULL',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_VIEW_VISIBILITY" ON "core"."view" ("visibility") ',
    );
  }
}
