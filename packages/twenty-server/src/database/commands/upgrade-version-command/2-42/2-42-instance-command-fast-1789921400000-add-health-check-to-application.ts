import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.42.0', 1789921400000)
export class AddHealthCheckToApplicationFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application"
         ADD COLUMN IF NOT EXISTS "healthCheckLogicFunctionId" uuid,
         ADD COLUMN IF NOT EXISTS "healthStatus" text,
         ADD COLUMN IF NOT EXISTS "healthMessage" text,
         ADD COLUMN IF NOT EXISTS "healthActionLabel" text,
         ADD COLUMN IF NOT EXISTS "healthCheckedAt" timestamptz`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application"
         DROP COLUMN IF EXISTS "healthCheckedAt",
         DROP COLUMN IF EXISTS "healthActionLabel",
         DROP COLUMN IF EXISTS "healthMessage",
         DROP COLUMN IF EXISTS "healthStatus",
         DROP COLUMN IF EXISTS "healthCheckLogicFunctionId"`,
    );
  }
}
