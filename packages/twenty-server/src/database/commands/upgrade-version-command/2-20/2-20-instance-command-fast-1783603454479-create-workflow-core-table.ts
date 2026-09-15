import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.20.0', 1783603454479)
export class CreateWorkflowCoreTableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."workflow" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" text,
        "lastPublishedVersionId" uuid,
        "universalIdentifier" uuid NOT NULL,
        "applicationId" uuid NOT NULL,
        "workspaceId" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_eb5e4cc1a9ef2e94805b676751b" PRIMARY KEY ("id"),
        CONSTRAINT "FK_fbce9a986a577698821a7e301b6" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_6819d862ed54fbf00cecaa0da4b" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_8ef15993c0e4bb37d1ceb9b87d"
        ON "core"."workflow" ("workspaceId", "universalIdentifier")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_WORKFLOW_WORKSPACE_ID"
        ON "core"."workflow" ("workspaceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_WORKFLOW_APPLICATION_ID"
        ON "core"."workflow" ("applicationId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."workflow"`);
  }
}
