import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.46.0', 1791130291063)
export class AddIsSystemToAgentAndWorkflowFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."agent" ADD COLUMN IF NOT EXISTS "isSystem" boolean NOT NULL DEFAULT false',
    );

    await queryRunner.query(
      'ALTER TABLE "core"."workflow" ADD COLUMN IF NOT EXISTS "isSystem" boolean NOT NULL DEFAULT false',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workflow" DROP COLUMN IF EXISTS "isSystem"',
    );

    await queryRunner.query(
      'ALTER TABLE "core"."agent" DROP COLUMN IF EXISTS "isSystem"',
    );
  }
}
