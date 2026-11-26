import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.65.0', 1795703699259)
export class AddListPinnedFieldUniversalIdentifiersToViewFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."view" ADD "listPinnedFieldUniversalIdentifiers" uuid array NOT NULL DEFAULT \'{}\'');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."view" DROP COLUMN "listPinnedFieldUniversalIdentifiers"');
  }
}
