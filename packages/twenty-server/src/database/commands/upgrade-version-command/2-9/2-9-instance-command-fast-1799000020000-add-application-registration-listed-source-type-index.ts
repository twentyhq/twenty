import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.9.0', 1799000020000)
export class AddApplicationRegistrationListedSourceTypeIndexFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_APPLICATION_REGISTRATION_IS_LISTED_SOURCE_TYPE" ON "core"."applicationRegistration" ("isListed", "sourceType") WHERE "deletedAt" IS NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_APPLICATION_REGISTRATION_IS_LISTED_SOURCE_TYPE"',
    );
  }
}
