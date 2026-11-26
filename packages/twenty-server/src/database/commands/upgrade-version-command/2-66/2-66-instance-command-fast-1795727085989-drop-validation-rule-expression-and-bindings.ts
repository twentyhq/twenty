import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.66.0', 1795727085989)
export class DropValidationRuleExpressionAndBindingsFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."validationRule" DROP COLUMN IF EXISTS "expression"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."validationRule" DROP COLUMN IF EXISTS "bindings"',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."validationRule" ADD COLUMN IF NOT EXISTS "expression" text',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."validationRule" ADD COLUMN IF NOT EXISTS "bindings" jsonb NOT NULL DEFAULT \'{}\'',
    );
  }
}
