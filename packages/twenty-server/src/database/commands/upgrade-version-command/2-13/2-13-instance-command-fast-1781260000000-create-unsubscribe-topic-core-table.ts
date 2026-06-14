import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.13.0', 1781260000000)
export class CreateUnsubscribeTopicCoreTableFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "core"."unsubscribeTopic_visibility_enum" AS ENUM ('PUBLIC', 'PRIVATE'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."unsubscribeTopic" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "name" character varying,
        "description" character varying,
        "visibility" "core"."unsubscribeTopic_visibility_enum" NOT NULL DEFAULT 'PRIVATE',
        "workspaceId" uuid NOT NULL,
        CONSTRAINT "PK_unsubscribeTopic_id" PRIMARY KEY ("id"),
        -- FK name must match TypeORM's generated hash for WorkspaceRelatedEntity.workspace (schema drift otherwise).
        CONSTRAINT "FK_16d7bf6f90fac4745c89e1e8d56" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_UNSUBSCRIBE_TOPIC_WORKSPACE_ID"
        ON "core"."unsubscribeTopic" ("workspaceId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."unsubscribeTopic"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."unsubscribeTopic_visibility_enum"`,
    );
  }
}
