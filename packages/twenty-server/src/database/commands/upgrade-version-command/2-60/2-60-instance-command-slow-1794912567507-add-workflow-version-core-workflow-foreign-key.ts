import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.60.0', 1794912567507, { type: 'slow' })
export class AddWorkflowVersionCoreWorkflowForeignKeySlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `DELETE FROM "core"."workflowVersion" "workflowVersion"
        WHERE NOT EXISTS (
          SELECT 1 FROM "core"."workflow" "workflow"
            WHERE "workflow"."id" = "workflowVersion"."coreWorkflowId"
        )`,
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workflowVersion" ADD CONSTRAINT "FK_a94dcf82da41ca8e07cc6d912a9" FOREIGN KEY ("coreWorkflowId") REFERENCES "core"."workflow"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workflowVersion" DROP CONSTRAINT "FK_a94dcf82da41ca8e07cc6d912a9"',
    );
  }
}
