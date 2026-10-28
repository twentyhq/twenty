import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.53.0', 1793195836509)
export class AgentAndSkillOverridableEntityFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."agent" ADD "overrides" jsonb, ADD "isActive" boolean NOT NULL DEFAULT true',
    );
    await queryRunner.query('ALTER TABLE "core"."skill" ADD "overrides" jsonb');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."skill" DROP COLUMN "overrides"');
    await queryRunner.query(
      'ALTER TABLE "core"."agent" DROP COLUMN "isActive", DROP COLUMN "overrides"',
    );
  }
}
