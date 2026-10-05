import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Position values render blank in the timeline. New position fields are created
// non audit logged; the ones predating the column carry the true default.
//
// Shaped like the 2.20 isSystemSideEffect backfill on this table: one unbatched
// UPDATE, no RETURNING. There is no index on "type", so the cost is a sequential
// scan, but an UPDATE takes ROW EXCLUSIVE rather than ACCESS EXCLUSIVE, so it
// never blocks readers; the matched set is one position field per object, and
// "isAuditLogged" is unindexed so the row updates stay HOT.
@RegisteredInstanceCommand('2.40.0', 1788885873411, { type: 'slow' })
export class BackfillIsAuditLoggedOnPositionFieldMetadataSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."fieldMetadata" SET "isAuditLogged" = false WHERE "type" = 'POSITION' AND "isAuditLogged" = true`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  // The paired fast command's down drops the column; nothing to undo here.
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
