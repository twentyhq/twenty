import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.42.0', 1790160278812)
export class AddWorkspaceSchemaMigrationLockFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."workspace" ADD "schemaMigrationStatus" character varying NOT NULL DEFAULT \'IDLE\'');
    await queryRunner.query('ALTER TABLE "core"."workspace" ADD "schemaMigrationStartedAt" TIMESTAMP WITH TIME ZONE');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."workspace" DROP COLUMN "schemaMigrationStartedAt"');
    await queryRunner.query('ALTER TABLE "core"."workspace" DROP COLUMN "schemaMigrationStatus"');
  }
}
