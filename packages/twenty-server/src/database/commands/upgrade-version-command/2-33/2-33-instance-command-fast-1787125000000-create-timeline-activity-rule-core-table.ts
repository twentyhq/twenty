import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.33.0', 1787125000000)
export class CreateTimelineActivityRuleCoreTableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."timelineActivityRule" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "universalIdentifier" uuid NOT NULL,
        "applicationId" uuid NOT NULL,
        "objectMetadataId" uuid NOT NULL,
        "relationFieldMetadataId" uuid,
        "resolution" text NOT NULL DEFAULT 'MATERIALIZED',
        "actions" text array NOT NULL DEFAULT '{}',
        "triggerFieldMetadataIds" uuid array,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_timelineActivityRule_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_8b456b8afbe2e8b6e1689b58445" FOREIGN KEY ("workspaceId")
          REFERENCES "core"."workspace"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ba969932163f40b7dbc150a2475" FOREIGN KEY ("applicationId")
          REFERENCES "core"."application"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_02e30f6150fb8c80e1a56cda209" FOREIGN KEY ("objectMetadataId")
          REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_949f9b89106b3cb47143c9f9979" FOREIGN KEY ("relationFieldMetadataId")
          REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE
      )`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_dcce030a959cf14af9caa232e6"
        ON "core"."timelineActivityRule" ("workspaceId", "universalIdentifier")`,
    );
    // Postgres treats NULLs as distinct, so the natural key needs two partial
    // unique indexes: one for the self rule, one per relation and resolution.
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_TIMELINE_ACTIVITY_RULE_SELF_UNIQUE"
        ON "core"."timelineActivityRule" ("workspaceId", "objectMetadataId")
        WHERE "relationFieldMetadataId" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_TIMELINE_ACTIVITY_RULE_RELATION_UNIQUE"
        ON "core"."timelineActivityRule" ("workspaceId", "objectMetadataId", "relationFieldMetadataId", "resolution")
        WHERE "relationFieldMetadataId" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_TIMELINE_ACTIVITY_RULE_WORKSPACE_ID"
        ON "core"."timelineActivityRule" ("workspaceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_TIMELINE_ACTIVITY_RULE_OBJECT_METADATA_ID"
        ON "core"."timelineActivityRule" ("objectMetadataId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_TIMELINE_ACTIVITY_RULE_RELATION_FIELD_METADATA_ID"
        ON "core"."timelineActivityRule" ("relationFieldMetadataId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS "core"."timelineActivityRule"`,
    );
  }
}
