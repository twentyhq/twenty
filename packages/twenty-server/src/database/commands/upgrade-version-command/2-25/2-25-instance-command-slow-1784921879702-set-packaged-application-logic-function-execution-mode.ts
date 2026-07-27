import { Logger } from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';

import {
  InstallPrebuiltLogicFunctionBundlesJob,
  type InstallPrebuiltLogicFunctionBundlesJobData,
} from 'src/engine/core-modules/logic-function/jobs/install-prebuilt-logic-function-bundles.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.25.0', 1784921879702, { type: 'slow' })
export class SetPackagedApplicationLogicFunctionExecutionModeSlowInstanceCommand
  implements SlowInstanceCommand
{
  private readonly logger = new Logger(
    SetPackagedApplicationLogicFunctionExecutionModeSlowInstanceCommand.name,
  );

  constructor(
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async runDataMigration(dataSource: DataSource): Promise<void> {
    // An UPDATE ... RETURNING is returned as [rows, affectedCount]
    const [updatedLogicFunctions]: [{ id: string; workspaceId: string }[]] =
      await dataSource.query(
        `UPDATE "core"."logicFunction" "logicFunction"
         SET "executionMode" = 'PREBUILT'
         FROM "core"."application" "application"
         WHERE "logicFunction"."applicationId" = "application"."id"
           AND "application"."sourceType" IN ('tarball', 'npm')
           AND "logicFunction"."executionMode" = 'LIVE'
           AND "logicFunction"."isBuildUpToDate" = true
           AND "logicFunction"."checksum" IS NOT NULL
           AND "logicFunction"."checksum" <> ''
           AND "logicFunction"."deletedAt" IS NULL
         RETURNING "logicFunction"."id", "logicFunction"."workspaceId"`,
      );

    this.logger.log(
      `Set ${updatedLogicFunctions.length} packaged-application logic function(s) to PREBUILT execution mode`,
    );

    const logicFunctionIdsByWorkspaceId = new Map<string, string[]>();

    for (const { id, workspaceId } of updatedLogicFunctions) {
      const bucket = logicFunctionIdsByWorkspaceId.get(workspaceId) ?? [];

      bucket.push(id);
      logicFunctionIdsByWorkspaceId.set(workspaceId, bucket);
    }

    let enqueuedWorkspaceCount = 0;

    for (const [
      workspaceId,
      logicFunctionIds,
    ] of logicFunctionIdsByWorkspaceId) {
      try {
        await this.messageQueueService.add<InstallPrebuiltLogicFunctionBundlesJobData>(
          InstallPrebuiltLogicFunctionBundlesJob.name,
          { workspaceId, logicFunctionIds },
          { retryLimit: 3 },
        );
        enqueuedWorkspaceCount++;
      } catch (error) {
        // The job only warms bundles ahead of first execution, so a queue
        // outage must not fail the upgrade: the executor installs on-demand.
        this.logger.warn(
          `Failed to enqueue prebuilt bundle installs for workspace ${workspaceId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    this.logger.log(
      `Enqueued prebuilt bundle installs for ${enqueuedWorkspaceCount}/${logicFunctionIdsByWorkspaceId.size} workspace(s)`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."logicFunction" "logicFunction"
       SET "executionMode" = 'LIVE'
       FROM "core"."application" "application"
       WHERE "logicFunction"."applicationId" = "application"."id"
         AND "application"."sourceType" IN ('tarball', 'npm')
         AND "logicFunction"."executionMode" = 'PREBUILT'`,
    );
  }
}
