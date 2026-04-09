import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

type BackfillDefinition = {
  table: string;
  parentTable: string;
  foreignKey: string;
};

// Order matters: parents must be backfilled before children
const BACKFILL_DEFINITIONS: BackfillDefinition[] = [
  {
    table: 'twoFactorAuthenticationMethod',
    parentTable: 'userWorkspace',
    foreignKey: 'userWorkspaceId',
  },
  {
    table: 'agentChatThread',
    parentTable: 'userWorkspace',
    foreignKey: 'userWorkspaceId',
  },
  {
    table: 'agentTurn',
    parentTable: 'agentChatThread',
    foreignKey: 'threadId',
  },
  {
    table: 'agentMessage',
    parentTable: 'agentChatThread',
    foreignKey: 'threadId',
  },
  {
    table: 'agentTurnEvaluation',
    parentTable: 'agentTurn',
    foreignKey: 'turnId',
  },
  {
    table: 'agentMessagePart',
    parentTable: 'agentMessage',
    foreignKey: 'messageId',
  },
  {
    table: 'indexFieldMetadata',
    parentTable: 'indexMetadata',
    foreignKey: 'indexMetadataId',
  },
  {
    table: 'applicationVariable',
    parentTable: 'application',
    foreignKey: 'applicationId',
  },
];

const TABLES = BACKFILL_DEFINITIONS.map((definition) => definition.table);

@RegisteredInstanceCommand('1.22.0', 1775758621018, { type: 'slow' })
export class BackfillWorkspaceIdOnIndirectEntitiesSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    for (const { table, parentTable, foreignKey } of BACKFILL_DEFINITIONS) {
      await dataSource.query(
        `UPDATE "core"."${table}" t
            SET "workspaceId" = p."workspaceId"
           FROM "core"."${parentTable}" p
          WHERE t."${foreignKey}" = p."id"
            AND t."workspaceId" IS NULL`,
      );
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      await queryRunner.query(
        `ALTER TABLE "core"."${table}" ALTER COLUMN "workspaceId" SET NOT NULL`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      await queryRunner.query(
        `ALTER TABLE "core"."${table}" ALTER COLUMN "workspaceId" DROP NOT NULL`,
      );
    }
  }
}
