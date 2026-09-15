import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.14.0', 1781515653781, { type: 'slow' })
export class SetTableWidgetViewsVisibilityToWorkspaceSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."view"
          SET "visibility" = 'WORKSPACE'
        WHERE "type" = 'TABLE_WIDGET'
          AND "visibility" = 'UNLISTED'`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
