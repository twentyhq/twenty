import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Every row held so far is a suspended run, and only a suspended run keeps its thread to itself
@RegisteredInstanceCommand('2.46.0', 1791411908603)
export class RenameAgentRunSuspensionToAgentRunFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."agentRunSuspension" RENAME TO "agentRun"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentRun" RENAME CONSTRAINT "PK_ffa8fcfd24c5a8e0122f5a682af" TO "PK_82593a9c5d721d889c9d6e8437a"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentRun" RENAME CONSTRAINT "FK_3005d9ef8e9f321e387a8ac0b6a" TO "FK_bfc4445cf736a36ff732258b063"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentRun" ADD "status" character varying NOT NULL DEFAULT \'SUSPENDED\'',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentRun" ALTER COLUMN "status" DROP DEFAULT',
    );
    await queryRunner.query('ALTER TABLE "core"."agentRun" ADD "outcome" jsonb');
    await queryRunner.query(
      'ALTER TABLE "core"."agentRun" DROP CONSTRAINT "UQ_AGENT_RUN_SUSPENSION_THREAD_ID"',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_AGENT_RUN_SUSPENDED_THREAD_ID_UNIQUE" ON "core"."agentRun" ("threadId") WHERE "status" = \'SUSPENDED\'',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // the previous shape holds suspended runs only
    await queryRunner.query(
      'DELETE FROM "core"."agentRun" WHERE "status" <> \'SUSPENDED\'',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_AGENT_RUN_SUSPENDED_THREAD_ID_UNIQUE"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentRun" ADD CONSTRAINT "UQ_AGENT_RUN_SUSPENSION_THREAD_ID" UNIQUE ("threadId")',
    );
    await queryRunner.query('ALTER TABLE "core"."agentRun" DROP COLUMN "outcome"');
    await queryRunner.query('ALTER TABLE "core"."agentRun" DROP COLUMN "status"');
    await queryRunner.query(
      'ALTER TABLE "core"."agentRun" RENAME CONSTRAINT "FK_bfc4445cf736a36ff732258b063" TO "FK_3005d9ef8e9f321e387a8ac0b6a"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentRun" RENAME CONSTRAINT "PK_82593a9c5d721d889c9d6e8437a" TO "PK_ffa8fcfd24c5a8e0122f5a682af"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentRun" RENAME TO "agentRunSuspension"',
    );
  }
}
