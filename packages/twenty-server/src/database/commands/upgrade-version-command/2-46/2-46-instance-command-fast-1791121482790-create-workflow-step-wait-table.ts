import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.46.0', 1791121482790)
export class CreateWorkflowStepWaitTableFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."workflowStepWait" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "workflowRunId" uuid NOT NULL, "stepId" character varying NOT NULL, "wait" jsonb NOT NULL, "eventName" character varying, "resumeAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_WORKFLOW_STEP_WAIT_RUN_STEP" UNIQUE ("workflowRunId", "stepId"), CONSTRAINT "PK_f29518230d0ab83dbe09d23b462" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_WORKFLOW_STEP_WAIT_RESUME_AT" ON "core"."workflowStepWait" ("resumeAt") ');
    await queryRunner.query('CREATE INDEX "IDX_WORKFLOW_STEP_WAIT_WORKSPACE_EVENT_NAME" ON "core"."workflowStepWait" ("workspaceId", "eventName") ');
    await queryRunner.query('ALTER TABLE "core"."workflowStepWait" ADD CONSTRAINT "FK_d67ed7b2a1b9aa3ac664ac142c8" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."workflowStepWait" DROP CONSTRAINT "FK_d67ed7b2a1b9aa3ac664ac142c8"');
    await queryRunner.query('DROP INDEX "core"."IDX_WORKFLOW_STEP_WAIT_WORKSPACE_EVENT_NAME"');
    await queryRunner.query('DROP INDEX "core"."IDX_WORKFLOW_STEP_WAIT_RESUME_AT"');
    await queryRunner.query('DROP TABLE "core"."workflowStepWait"');
  }
}
