import { Injectable } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { BACKFILL_STORED_FORMULA_FIELDS_JOB_NAME } from 'src/engine/core-modules/stored-formula-field/constants/backfill-stored-formula-fields-job-name.constant';
import { type BackfillStoredFormulaFieldsJobData } from 'src/engine/core-modules/stored-formula-field/types/backfill-stored-formula-fields-job-data.type';
import { DeferredWorkspaceOperationHandlerDecorator } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-operation-handlers/decorators/deferred-workspace-operation-handler.decorator';
import { type DeferredWorkspaceOperationHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-operation-handlers/interfaces/deferred-workspace-operation-handler.interface';
import { type DeferredWorkspaceOperationExecutionArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation-execution-args.type';
import { type DeferredWorkspaceOperationPayload } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation.type';

@Injectable()
@DeferredWorkspaceOperationHandlerDecorator('compute_storedFormulaFields')
export class ComputeStoredFormulaFieldsDeferredOperationHandlerService implements DeferredWorkspaceOperationHandler<'compute_storedFormulaFields'> {
  readonly metadataNamesToLoad = ['objectMetadata' as const];

  constructor(
    @InjectMessageQueue(MessageQueue.storedFormulaFieldQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async execute({
    workspaceId,
    payload: { objectMetadataId, formulaFieldMetadataIds },
  }: DeferredWorkspaceOperationExecutionArgs<
    DeferredWorkspaceOperationPayload<'compute_storedFormulaFields'>
  >): Promise<void> {
    await this.messageQueueService.add<BackfillStoredFormulaFieldsJobData>(
      BACKFILL_STORED_FORMULA_FIELDS_JOB_NAME,
      {
        workspaceId,
        objectMetadataId,
        formulaFieldMetadataIds,
        afterRecordId: null,
      },
      { workspaceId, isWorkspaceJob: true },
    );
  }
}
