import { Logger } from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Position values render blank in the timeline. New position fields are created
// non audit logged; the ones predating the column carry the true default.
@RegisteredInstanceCommand('2.40.0', 1788885873411, { type: 'slow' })
export class BackfillIsAuditLoggedOnPositionFieldMetadataSlowInstanceCommand
  implements SlowInstanceCommand
{
  private readonly logger = new Logger(
    BackfillIsAuditLoggedOnPositionFieldMetadataSlowInstanceCommand.name,
  );

  async runDataMigration(dataSource: DataSource): Promise<void> {
    const updatedRows: { id: string }[] = await dataSource.query(
      `UPDATE "core"."fieldMetadata"
       SET "isAuditLogged" = false
       WHERE "type" = 'POSITION'
       AND "isAuditLogged" = true
       RETURNING "id"`,
    );

    this.logger.log(
      `core.fieldMetadata: backfilled isAuditLogged on ${updatedRows.length} position field(s)`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  // The paired fast command's down drops the column; nothing to undo here.
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
