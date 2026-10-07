import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// The index is built concurrently by
// add-upgrade-migration-workspace-id-created-at-index-concurrently. This step
// stays so instances that already recorded it keep a known upgrade cursor.
@RegisteredInstanceCommand('2.46.0', 1791215192958)
export class AddUpgradeMigrationWorkspaceIdCreatedAtIndexFastInstanceCommand implements FastInstanceCommand {
  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
