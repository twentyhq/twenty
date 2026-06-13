import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.13.0', 1781250000000)
export class CreateMessageSuppressionCoreTableFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."messageSuppression_reason_enum" AS ENUM ('BOUNCE', 'COMPLAINT', 'UNSUBSCRIBE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."messageSuppression_source_enum" AS ENUM ('WEBHOOK', 'SYSTEM')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."messageSuppression" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "emailAddress" character varying NOT NULL,
        "reason" "core"."messageSuppression_reason_enum" NOT NULL,
        "source" "core"."messageSuppression_source_enum" NOT NULL,
        "providerEventId" character varying,
        "unsubscribeTopicId" uuid,
        "workspaceId" uuid NOT NULL,
        CONSTRAINT "PK_messageSuppression_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_6eba121ed8e57afaa1f052cb685" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_MESSAGE_SUPPRESSION_GLOBAL_UNIQUE"
        ON "core"."messageSuppression" ("workspaceId", "emailAddress")
        WHERE "unsubscribeTopicId" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_MESSAGE_SUPPRESSION_TOPIC_UNIQUE"
        ON "core"."messageSuppression" ("workspaceId", "emailAddress", "unsubscribeTopicId")
        WHERE "unsubscribeTopicId" IS NOT NULL`,
    );
    // The two unique indexes are partial, so neither serves the workspace
    // ON DELETE CASCADE scan; this plain index does.
    await queryRunner.query(
      `CREATE INDEX "IDX_MESSAGE_SUPPRESSION_WORKSPACE_ID"
        ON "core"."messageSuppression" ("workspaceId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "core"."messageSuppression"`);
    await queryRunner.query(
      `DROP TYPE "core"."messageSuppression_reason_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."messageSuppression_source_enum"`,
    );
  }
}
