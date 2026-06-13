import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.13.0', 1781260000000)
export class CreateMessageTopicCoreTableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."messageTopic_visibility_enum" AS ENUM ('PUBLIC', 'PRIVATE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."messageTopic" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "name" character varying,
        "description" character varying,
        "visibility" "core"."messageTopic_visibility_enum" NOT NULL DEFAULT 'PRIVATE',
        "workspaceId" uuid NOT NULL,
        CONSTRAINT "PK_messageTopic_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_messageTopic_workspaceId" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_MESSAGE_TOPIC_WORKSPACE_ID"
        ON "core"."messageTopic" ("workspaceId")`,
    );
    // Both tables are core now, so the per-topic opt-out can be a real FK:
    // deleting a group removes its opt-outs (a per-topic row must never become a
    // global block, which ON DELETE SET NULL would do).
    await queryRunner.query(
      `ALTER TABLE "core"."messageSuppression"
        ADD CONSTRAINT "FK_messageSuppression_topicId"
        FOREIGN KEY ("topicId") REFERENCES "core"."messageTopic"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."messageSuppression" DROP CONSTRAINT "FK_messageSuppression_topicId"`,
    );
    await queryRunner.query(`DROP TABLE "core"."messageTopic"`);
    await queryRunner.query(`DROP TYPE "core"."messageTopic_visibility_enum"`);
  }
}
