import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.63.0', 1795429429999)
export class AddViewFieldLabelFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."viewField" ADD "label" text');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."viewField" DROP COLUMN "label"');
  }
}
