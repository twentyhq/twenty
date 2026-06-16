import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

const TABLES_WITH_IS_SYSTEM_SIDE_EFFECT = [
  'view',
  'viewField',
  'indexMetadata',
  'commandMenuItem',
  'pageLayout',
  'pageLayoutTab',
  'pageLayoutWidget',
  'fieldMetadata',
] as const;

@RegisteredInstanceCommand('2.14.0', 1781600000000)
export class AddIsSystemSideEffectFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES_WITH_IS_SYSTEM_SIDE_EFFECT) {
      await queryRunner.query(
        `ALTER TABLE "core"."${table}" ADD COLUMN IF NOT EXISTS "isSystemSideEffect" boolean NOT NULL DEFAULT false`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES_WITH_IS_SYSTEM_SIDE_EFFECT) {
      await queryRunner.query(
        `ALTER TABLE "core"."${table}" DROP COLUMN IF EXISTS "isSystemSideEffect"`,
      );
    }
  }
}
