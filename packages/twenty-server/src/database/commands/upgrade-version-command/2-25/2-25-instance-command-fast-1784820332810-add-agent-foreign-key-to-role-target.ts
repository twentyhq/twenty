import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.25.0', 1784820332810)
export class AddAgentForeignKeyToRoleTargetFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."roleTarget" DROP CONSTRAINT IF EXISTS "FK_16433a32ab13a294569e52a10e0"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "FK_16433a32ab13a294569e52a10e0" FOREIGN KEY ("agentId") REFERENCES "core"."agent"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."roleTarget" DROP CONSTRAINT IF EXISTS "FK_16433a32ab13a294569e52a10e0"',
    );
  }
}
