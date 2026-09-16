import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type CoreWorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-version.dto';
import { type CreateCoreWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/create-core-workflow-version-step.input';
import { type WorkflowStepPositionUpdateInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-step-position-update.input';
import { type WorkflowActionDTO } from 'src/engine/core-modules/workflow/dtos/workflow-action.dto';
import { type WorkflowVersionStepChangesDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-step-changes.dto';
import { type WorkflowVersionTriggerDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-trigger.dto';
import { CoreWorkflowIdResolutionService } from 'src/engine/core-modules/workflow/services/core-workflow-id-resolution.service';
import { CoreWorkflowVersionListService } from 'src/engine/core-modules/workflow/services/core-workflow-version-list.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowStepConnectionOptions } from 'src/modules/workflow/workflow-builder/workflow-version-step/types/WorkflowStepConnectionOptions';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.workspace-service';
import { WorkflowVersionEdgeWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-edge/workflow-version-edge.workspace-service';
import { WorkflowVersionWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.workspace-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

@Injectable()
export class CoreWorkflowVersionMutationWorkspaceService {
  constructor(
    private readonly coreWorkflowIdResolutionService: CoreWorkflowIdResolutionService,
    private readonly coreWorkflowVersionListService: CoreWorkflowVersionListService,
    private readonly workflowVersionStepWorkspaceService: WorkflowVersionStepWorkspaceService,
    private readonly workflowVersionEdgeWorkspaceService: WorkflowVersionEdgeWorkspaceService,
    private readonly workflowVersionWorkspaceService: WorkflowVersionWorkspaceService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async createStep({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: CreateCoreWorkflowVersionStepInput;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const { coreWorkflowVersionId, ...stepInput } = input;

    const { workspaceWorkflowVersionId } =
      await this.coreWorkflowIdResolutionService.resolveWorkspaceVersionIdOrThrow(
        { workspaceId, coreWorkflowVersionId },
      );

    return this.workflowVersionStepWorkspaceService.createWorkflowVersionStep({
      workspaceId,
      input: {
        ...stepInput,
        workflowVersionId: workspaceWorkflowVersionId,
      },
    });
  }

  async updateStep({
    workspaceId,
    coreWorkflowVersionId,
    step,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
    step: WorkflowAction;
  }): Promise<WorkflowActionDTO> {
    const { workspaceWorkflowVersionId } =
      await this.coreWorkflowIdResolutionService.resolveWorkspaceVersionIdOrThrow(
        { workspaceId, coreWorkflowVersionId },
      );

    return this.workflowVersionStepWorkspaceService.updateWorkflowVersionStep({
      workspaceId,
      workflowVersionId: workspaceWorkflowVersionId,
      step,
    });
  }

  async updateTrigger({
    workspaceId,
    coreWorkflowVersionId,
    trigger,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
    trigger: WorkflowTrigger;
  }): Promise<WorkflowVersionTriggerDTO> {
    const { workspaceWorkflowVersionId } =
      await this.coreWorkflowIdResolutionService.resolveWorkspaceVersionIdOrThrow(
        { workspaceId, coreWorkflowVersionId },
      );

    return this.workflowVersionStepWorkspaceService.updateWorkflowVersionTrigger(
      {
        workspaceId,
        workflowVersionId: workspaceWorkflowVersionId,
        trigger,
      },
    );
  }

  async deleteStep({
    workspaceId,
    coreWorkflowVersionId,
    stepIdToDelete,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
    stepIdToDelete: string;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const { workspaceWorkflowVersionId } =
      await this.coreWorkflowIdResolutionService.resolveWorkspaceVersionIdOrThrow(
        { workspaceId, coreWorkflowVersionId },
      );

    return this.workflowVersionStepWorkspaceService.deleteWorkflowVersionStep({
      workspaceId,
      workflowVersionId: workspaceWorkflowVersionId,
      stepIdToDelete,
    });
  }

  async duplicateStep({
    workspaceId,
    coreWorkflowVersionId,
    stepId,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
    stepId: string;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const { workspaceWorkflowVersionId } =
      await this.coreWorkflowIdResolutionService.resolveWorkspaceVersionIdOrThrow(
        { workspaceId, coreWorkflowVersionId },
      );

    return this.workflowVersionStepWorkspaceService.duplicateWorkflowVersionStep(
      {
        workspaceId,
        workflowVersionId: workspaceWorkflowVersionId,
        stepId,
      },
    );
  }

  async createEdge({
    workspaceId,
    coreWorkflowVersionId,
    source,
    target,
    sourceConnectionOptions,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
    source: string;
    target: string;
    sourceConnectionOptions?: WorkflowStepConnectionOptions;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const { workspaceWorkflowVersionId } =
      await this.coreWorkflowIdResolutionService.resolveWorkspaceVersionIdOrThrow(
        { workspaceId, coreWorkflowVersionId },
      );

    return this.workflowVersionEdgeWorkspaceService.createWorkflowVersionEdge({
      workspaceId,
      workflowVersionId: workspaceWorkflowVersionId,
      source,
      target,
      sourceConnectionOptions,
    });
  }

  async deleteEdge({
    workspaceId,
    coreWorkflowVersionId,
    source,
    target,
    sourceConnectionOptions,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
    source: string;
    target: string;
    sourceConnectionOptions?: WorkflowStepConnectionOptions;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const { workspaceWorkflowVersionId } =
      await this.coreWorkflowIdResolutionService.resolveWorkspaceVersionIdOrThrow(
        { workspaceId, coreWorkflowVersionId },
      );

    return this.workflowVersionEdgeWorkspaceService.deleteWorkflowVersionEdge({
      workspaceId,
      workflowVersionId: workspaceWorkflowVersionId,
      source,
      target,
      sourceConnectionOptions,
    });
  }

  async updatePositions({
    workspaceId,
    coreWorkflowVersionId,
    positions,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
    positions: WorkflowStepPositionUpdateInput[];
  }): Promise<void> {
    const { workspaceWorkflowVersionId } =
      await this.coreWorkflowIdResolutionService.resolveWorkspaceVersionIdOrThrow(
        { workspaceId, coreWorkflowVersionId },
      );

    await this.workflowVersionWorkspaceService.updateWorkflowVersionPositions({
      workspaceId,
      workflowVersionId: workspaceWorkflowVersionId,
      positions,
    });
  }

  async createDraftFromCoreWorkflowVersion({
    workspaceId,
    coreWorkflowId,
    coreWorkflowVersionIdToCopy,
  }: {
    workspaceId: string;
    coreWorkflowId: string;
    coreWorkflowVersionIdToCopy: string;
  }): Promise<CoreWorkflowVersionDTO> {
    const { workspaceWorkflowId } =
      await this.coreWorkflowIdResolutionService.resolveWorkspaceWorkflowIdOrThrow(
        { workspaceId, coreWorkflowId },
      );

    const { workspaceWorkflowVersionId } =
      await this.coreWorkflowIdResolutionService.resolveWorkspaceVersionIdOrThrow(
        { workspaceId, coreWorkflowVersionId: coreWorkflowVersionIdToCopy },
      );

    const draft =
      await this.workflowVersionWorkspaceService.createDraftFromWorkflowVersion(
        {
          workspaceId,
          workflowId: workspaceWorkflowId,
          workflowVersionIdToCopy: workspaceWorkflowVersionId,
        },
      );

    return this.findCoreVersionOfWorkspaceVersionOrThrow({
      workspaceId,
      workspaceWorkflowVersionId: draft.id,
    });
  }

  private async findCoreVersionOfWorkspaceVersionOrThrow({
    workspaceId,
    workspaceWorkflowVersionId,
  }: {
    workspaceId: string;
    workspaceWorkflowVersionId: string;
  }): Promise<CoreWorkflowVersionDTO> {
    const coreWorkflowVersionId =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workflowVersionRepository =
          this.workspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
            'workflowVersion',
            { shouldBypassPermissionChecks: true },
          );

        const workspaceVersion = await workflowVersionRepository.findOne({
          where: { id: workspaceWorkflowVersionId },
        });

        return workspaceVersion?.coreWorkflowVersionId ?? null;
      }, buildSystemAuthContext(workspaceId));

    if (!isDefined(coreWorkflowVersionId)) {
      throw new WorkflowQueryValidationException(
        `Workspace version '${workspaceWorkflowVersionId}' has no core twin`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Draft creation failed, please retry`,
        },
      );
    }

    const coreWorkflowVersion =
      await this.coreWorkflowVersionListService.findOneByCoreWorkflowVersionId({
        workspaceId,
        coreWorkflowVersionId,
      });

    if (!isDefined(coreWorkflowVersion)) {
      throw new WorkflowQueryValidationException(
        `Core version '${coreWorkflowVersionId}' not found after the draft write`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Draft creation failed, please retry`,
        },
      );
    }

    return coreWorkflowVersion;
  }
}
