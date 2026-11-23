import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.64.0', 1795439685598)
export class DropWorkflowVisibilityFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workflow" DROP COLUMN IF EXISTS "visibility"',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workflow" ADD COLUMN IF NOT EXISTS "visibility" varchar',
    );
    await queryRunner.query(
      'UPDATE "core"."workflow" SET "visibility" = CASE WHEN "isPrivate" THEN \'PRIVATE\' ELSE \'WORKSPACE\' END WHERE "visibility" IS NULL',
    );
  }
}
