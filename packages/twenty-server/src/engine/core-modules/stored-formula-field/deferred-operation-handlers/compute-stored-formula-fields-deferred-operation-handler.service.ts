import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { StoredFormulaFieldComputationService } from 'src/engine/core-modules/stored-formula-field/services/stored-formula-field-computation.service';
import { DeferredWorkspaceOperationHandlerDecorator } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-operation-handlers/decorators/deferred-workspace-operation-handler.decorator';
import { type DeferredWorkspaceOperationHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-operation-handlers/interfaces/deferred-workspace-operation-handler.interface';
import { DeferredWorkspaceOperationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-operation-runner.service';
import { type DeferredWorkspaceOperationExecutionArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation-execution-args.type';
import { type DeferredWorkspaceOperationPayload } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation.type';

@Injectable()
@DeferredWorkspaceOperationHandlerDecorator('compute_storedFormulaFields')
export class ComputeStoredFormulaFieldsDeferredOperationHandlerService implements DeferredWorkspaceOperationHandler<'compute_storedFormulaFields'> {
  readonly metadataNamesToLoad = ['objectMetadata' as const];

  constructor(
    private readonly storedFormulaFieldComputationService: StoredFormulaFieldComputationService,
    private readonly deferredWorkspaceOperationRunnerService: DeferredWorkspaceOperationRunnerService,
  ) {}

  async execute({
    workspaceId,
    payload: {
      objectMetadataId,
      formulaFieldMetadataIds,
      afterRecordId = null,
    },
  }: DeferredWorkspaceOperationExecutionArgs<
    DeferredWorkspaceOperationPayload<'compute_storedFormulaFields'>
  >): Promise<void> {
    let nextAfterRecordId: string | null = afterRecordId;

    do {
      nextAfterRecordId =
        await this.storedFormulaFieldComputationService.recomputeStoredFormulaFieldsOfNextRecords(
          {
            workspaceId,
            objectMetadataId,
            formulaFieldMetadataIds,
            afterRecordId: nextAfterRecordId,
          },
        );

      const checkpointRecordId = nextAfterRecordId;

      // A retried operation resumes after the last page it computed
      if (isDefined(checkpointRecordId)) {
        await this.deferredWorkspaceOperationRunnerService.updateInProgressOperationPayload(
          {
            workspaceId,
            name: 'compute_storedFormulaFields',
            updatePayload: (payload) => ({
              ...payload,
              afterRecordId: checkpointRecordId,
            }),
          },
        );
      }
    } while (isDefined(nextAfterRecordId));
  }
}
