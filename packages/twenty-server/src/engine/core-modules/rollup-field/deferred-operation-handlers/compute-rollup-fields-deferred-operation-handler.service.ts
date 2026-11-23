import { Injectable } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { BACKFILL_ROLLUP_FIELDS_JOB_NAME } from 'src/engine/core-modules/rollup-field/constants/backfill-rollup-fields-job-name.constant';
import { type BackfillRollupFieldsJobData } from 'src/engine/core-modules/rollup-field/types/backfill-rollup-fields-job-data.type';
import { DeferredWorkspaceOperationHandlerDecorator } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-operation-handlers/decorators/deferred-workspace-operation-handler.decorator';
import { type DeferredWorkspaceOperationHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-operation-handlers/interfaces/deferred-workspace-operation-handler.interface';
import { type DeferredWorkspaceOperationExecutionArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation-execution-args.type';
import { type DeferredWorkspaceOperationPayload } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation.type';

@Injectable()
@DeferredWorkspaceOperationHandlerDecorator('compute_rollupFields')
export class ComputeRollupFieldsDeferredOperationHandlerService implements DeferredWorkspaceOperationHandler<'compute_rollupFields'> {
  readonly metadataNamesToLoad = ['objectMetadata' as const];

  constructor(
    @InjectMessageQueue(MessageQueue.rollupFieldQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async execute({
    workspaceId,
    payload: { objectMetadataId, rollupFieldMetadataIds },
  }: DeferredWorkspaceOperationExecutionArgs<
    DeferredWorkspaceOperationPayload<'compute_rollupFields'>
  >): Promise<void> {
    await this.messageQueueService.add<BackfillRollupFieldsJobData>(
      BACKFILL_ROLLUP_FIELDS_JOB_NAME,
      {
        workspaceId,
        objectMetadataId,
        rollupFieldMetadataIds,
        afterRecordId: null,
      },
      { workspaceId, isWorkspaceJob: true },
    );
  }
}
