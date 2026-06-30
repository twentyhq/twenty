import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.18.0', 1801000120000)
export class CreatePendingMetadataDropCoreTableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."pendingMetadataDrop" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "kind" character varying NOT NULL,
        "schemaName" character varying NOT NULL,
        "tableName" character varying NOT NULL,
        "columnNames" jsonb NOT NULL,
        "enumNames" jsonb NOT NULL,
        "columnDefinitions" jsonb,
        "applicationId" uuid,
        "removedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "scheduledDropAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "workspaceId" uuid NOT NULL,
        CONSTRAINT "PK_pendingMetadataDrop_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_PENDING_METADATA_DROP_WORKSPACE_ID"
        ON "core"."pendingMetadataDrop" ("workspaceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_PENDING_METADATA_DROP_SCHEDULED_DROP_AT"
        ON "core"."pendingMetadataDrop" ("scheduledDropAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_PENDING_METADATA_DROP_TARGET"
        ON "core"."pendingMetadataDrop" ("workspaceId", "schemaName", "tableName")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS "core"."pendingMetadataDrop"`,
    );
  }
}
