import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.46.0', 1791206020497)
export class AddSignUrlToVariablesFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."applicationRegistrationVariable" ADD "signUrl" boolean NOT NULL DEFAULT false');
    await queryRunner.query('ALTER TABLE "core"."applicationVariable" ADD "signUrl" boolean NOT NULL DEFAULT false');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."applicationVariable" DROP COLUMN "signUrl"');
    await queryRunner.query('ALTER TABLE "core"."applicationRegistrationVariable" DROP COLUMN "signUrl"');
  }
}
