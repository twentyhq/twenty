import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const STANDARD_ADMIN_ROLE_UNIVERSAL_IDENTIFIER =
  '20202020-02c2-43f2-b94d-cab1f2b532eb';

// So admins and the role new members join with can reach General
@RegisteredInstanceCommand('2.51.0', 1792686689823, { type: 'slow' })
export class BackfillRoleAgentChatChannelAccessSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."role" SET "canAccessAllAgentChatChannels" = true
       WHERE "universalIdentifier" = $1
         OR "id" IN (SELECT "defaultRoleId" FROM "core"."workspace" WHERE "defaultRoleId" IS NOT NULL)`,
      [STANDARD_ADMIN_ROLE_UNIVERSAL_IDENTIFIER],
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
