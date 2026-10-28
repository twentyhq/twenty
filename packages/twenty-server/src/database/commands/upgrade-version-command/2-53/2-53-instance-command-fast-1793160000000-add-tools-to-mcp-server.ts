import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.53.0', 1793160000000)
export class AddToolsToMcpServerFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."mcpServer" ADD "tools" jsonb NOT NULL DEFAULT \'[]\'',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."mcpServer" ADD "toolsSyncedAt" TIMESTAMP WITH TIME ZONE',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."mcpServer" ADD "toolsSyncError" character varying',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."mcpServer" DROP COLUMN "toolsSyncError"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."mcpServer" DROP COLUMN "toolsSyncedAt"',
    );
    await queryRunner.query('ALTER TABLE "core"."mcpServer" DROP COLUMN "tools"');
  }
}
