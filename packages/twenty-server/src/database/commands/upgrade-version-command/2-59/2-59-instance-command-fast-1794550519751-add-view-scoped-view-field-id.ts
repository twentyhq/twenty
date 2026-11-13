import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.59.0', 1794550519751)
export class AddViewScopedViewFieldIdFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD "scopedViewFieldId" uuid',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_VIEW_SCOPED_VIEW_FIELD_ID_UNIQUE" ON "core"."view" ("scopedViewFieldId") WHERE "deletedAt" IS NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD CONSTRAINT "FK_005240b4e16d4075e552c54104a" FOREIGN KEY ("scopedViewFieldId") REFERENCES "core"."viewField"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP CONSTRAINT "FK_005240b4e16d4075e552c54104a"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_VIEW_SCOPED_VIEW_FIELD_ID_UNIQUE"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP COLUMN "scopedViewFieldId"',
    );
  }
}
