import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.65.0', 1795719490855)
export class AddValidationRuleTreeFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."validationRule" ADD "tree" jsonb');
    await queryRunner.query('ALTER TABLE "core"."validationRule" ALTER COLUMN "expression" DROP NOT NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."validationRule" ALTER COLUMN "expression" SET NOT NULL');
    await queryRunner.query('ALTER TABLE "core"."validationRule" DROP COLUMN "tree"');
  }
}
