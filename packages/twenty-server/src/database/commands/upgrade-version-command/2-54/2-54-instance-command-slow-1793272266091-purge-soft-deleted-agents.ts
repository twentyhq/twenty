import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.54.0', 1793272266091, { type: 'slow' })
export class PurgeSoftDeletedAgentsSlowInstanceCommand implements SlowInstanceCommand {
  // 2.54 stops filtering on deletedAt, so soft-deleted agents would come back live
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      'DELETE FROM "core"."agent" WHERE "deletedAt" IS NOT NULL',
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  // Deleted soft-deleted agents are not restored
  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
