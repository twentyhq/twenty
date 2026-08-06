import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// View field groups are created by the user-facing CRUD API, by manifest apps and
// by the engine, so the column defaults to false; the 2-28 record-page reconcile
// command flags the engine/standard-derived rows afterwards.
@RegisteredInstanceCommand('2.28.0', 1786010740000)
export class AddIsSystemSideEffectToViewFieldGroupFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."viewFieldGroup" ADD COLUMN IF NOT EXISTS "isSystemSideEffect" boolean NOT NULL DEFAULT false',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."viewFieldGroup" DROP COLUMN IF EXISTS "isSystemSideEffect"',
    );
  }
}
