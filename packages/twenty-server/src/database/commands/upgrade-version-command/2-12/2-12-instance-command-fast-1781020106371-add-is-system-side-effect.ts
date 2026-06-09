import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.12.0', 1781020106371)
export class AddIsSystemSideEffectFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."view" ADD "isSystemSideEffect" boolean NOT NULL DEFAULT false');
    await queryRunner.query('ALTER TABLE "core"."viewFieldGroup" ADD "isSystemSideEffect" boolean NOT NULL DEFAULT false');
    await queryRunner.query('ALTER TABLE "core"."viewField" ADD "isSystemSideEffect" boolean NOT NULL DEFAULT false');
    await queryRunner.query('ALTER TABLE "core"."pageLayoutWidget" ADD "isSystemSideEffect" boolean NOT NULL DEFAULT false');
    await queryRunner.query('ALTER TABLE "core"."pageLayoutTab" ADD "isSystemSideEffect" boolean NOT NULL DEFAULT false');
    await queryRunner.query('ALTER TABLE "core"."pageLayout" ADD "isSystemSideEffect" boolean NOT NULL DEFAULT false');
    await queryRunner.query('ALTER TABLE "core"."commandMenuItem" ADD "isSystemSideEffect" boolean NOT NULL DEFAULT false');
    await queryRunner.query('ALTER TABLE "core"."navigationMenuItem" ADD "isSystemSideEffect" boolean NOT NULL DEFAULT false');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."navigationMenuItem" DROP COLUMN "isSystemSideEffect"');
    await queryRunner.query('ALTER TABLE "core"."commandMenuItem" DROP COLUMN "isSystemSideEffect"');
    await queryRunner.query('ALTER TABLE "core"."pageLayout" DROP COLUMN "isSystemSideEffect"');
    await queryRunner.query('ALTER TABLE "core"."pageLayoutTab" DROP COLUMN "isSystemSideEffect"');
    await queryRunner.query('ALTER TABLE "core"."pageLayoutWidget" DROP COLUMN "isSystemSideEffect"');
    await queryRunner.query('ALTER TABLE "core"."viewField" DROP COLUMN "isSystemSideEffect"');
    await queryRunner.query('ALTER TABLE "core"."viewFieldGroup" DROP COLUMN "isSystemSideEffect"');
    await queryRunner.query('ALTER TABLE "core"."view" DROP COLUMN "isSystemSideEffect"');
  }
}
