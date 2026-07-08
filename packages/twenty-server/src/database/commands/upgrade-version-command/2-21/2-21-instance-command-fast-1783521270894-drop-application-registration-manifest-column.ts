import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Drops the legacy "manifest" jsonb column, superseded by file storage via
// "manifestFileId" in 2.20. Registered against 2.21.0 so it stays dormant
// until 2.21 is current (the sequence only runs previous + current versions).
// down() restores the column but not its data: manifests then live only in
// file storage and are lazily rehydrated by the read path.
@RegisteredInstanceCommand('2.21.0', 1783521270894)
export class DropApplicationRegistrationManifestColumnFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP COLUMN IF EXISTS "manifest"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD COLUMN IF NOT EXISTS "manifest" jsonb`,
    );
  }
}
