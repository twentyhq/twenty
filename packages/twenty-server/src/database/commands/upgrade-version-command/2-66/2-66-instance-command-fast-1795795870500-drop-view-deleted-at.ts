import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

const VIEW_TABLE_NAMES = [
  'view',
  'viewField',
  'viewFieldGroup',
  'viewFilter',
  'viewFilterGroup',
  'viewGroup',
  'viewSort',
];

@RegisteredInstanceCommand('2.66.0', 1795795870500)
export class DropViewDeletedAtFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const tableName of VIEW_TABLE_NAMES) {
      await queryRunner.query(
        `ALTER TABLE "core"."${tableName}" DROP COLUMN IF EXISTS "deletedAt"`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const tableName of VIEW_TABLE_NAMES) {
      await queryRunner.query(
        `ALTER TABLE "core"."${tableName}" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP WITH TIME ZONE`,
      );
    }
  }
}
