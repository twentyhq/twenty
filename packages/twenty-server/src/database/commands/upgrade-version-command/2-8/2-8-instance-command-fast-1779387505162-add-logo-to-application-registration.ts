import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.8.0', 1779387505162)
export class AddLogoToApplicationRegistrationFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" ADD "logo" text',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" ADD "logoFileId" uuid',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" DROP COLUMN "logoFileId"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" DROP COLUMN "logo"',
    );
  }
}
