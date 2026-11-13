import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.59.0', 1794591789191)
export class AddViewOwnerViewFieldIdFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD "ownerViewFieldId" uuid',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_VIEW_OWNER_VIEW_FIELD_ID_UNIQUE" ON "core"."view" ("ownerViewFieldId") WHERE "deletedAt" IS NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD CONSTRAINT "FK_9f78e8f3cf14039defb273274cc" FOREIGN KEY ("ownerViewFieldId") REFERENCES "core"."viewField"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP CONSTRAINT "FK_9f78e8f3cf14039defb273274cc"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_VIEW_OWNER_VIEW_FIELD_ID_UNIQUE"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP COLUMN "ownerViewFieldId"',
    );
  }
}
