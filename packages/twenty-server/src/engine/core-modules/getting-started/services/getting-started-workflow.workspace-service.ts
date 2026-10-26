import { Injectable } from '@nestjs/common';

import { EmailOperation } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { GETTING_STARTED_STEP_DEFINITIONS } from 'src/engine/core-modules/getting-started/constants/getting-started-step-definitions.constant';
import { GETTING_STARTED_WORKFLOW_USER_VAR_KEY_PREFIX } from 'src/engine/core-modules/getting-started/constants/getting-started-workflow-user-var-key-prefix.constant';
import { type GettingStartedWorkflowDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-workflow.dto';
import { GettingStartedStepKind } from 'src/engine/core-modules/getting-started/enums/getting-started-step-kind.enum';
import { type GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import {
  GettingStartedException,
  GettingStartedExceptionCode,
} from 'src/engine/core-modules/getting-started/getting-started.exception';
import { GettingStartedService } from 'src/engine/core-modules/getting-started/services/getting-started.service';
import { type GettingStartedKeyValueTypeMap } from 'src/engine/core-modules/getting-started/types/getting-started-key-value-type-map.type';
import { type GettingStartedWorkflowTemplate } from 'src/engine/core-modules/getting-started/types/getting-started-workflow-template.type';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { WorkflowStatus } from 'src/engine/core-modules/workflow/enums/workflow-status.enum';
import { CoreWorkflowLifecycleWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-lifecycle.workspace-service';
import { CoreWorkflowListService } from 'src/engine/core-modules/workflow/services/core-workflow-list.service';
import { CoreWorkflowMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-mutation.workspace-service';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';

@Injectable()
export class GettingStartedWorkflowWorkspaceService {
  constructor(
    private readonly userVarsService: UserVarsService<GettingStartedKeyValueTypeMap>,
    private readonly cacheLockService: CacheLockService,
    private readonly coreWorkflowListService: CoreWorkflowListService,
    private readonly coreWorkflowMutationWorkspaceService: CoreWorkflowMutationWorkspaceService,
    private readonly coreWorkflowLifecycleWorkspaceService: CoreWorkflowLifecycleWorkspaceService,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly gettingStartedService: GettingStartedService,
  ) {}

  async prepareWorkflow({
    userId,
    workspaceId,
    userWorkspaceId,
    step,
    activate,
  }: {
    userId: string;
    workspaceId: string;
    userWorkspaceId: string;
    step: GettingStartedStep;
    activate: boolean;
  }): Promise<GettingStartedWorkflowDTO> {
    const stepDefinition = GETTING_STARTED_STEP_DEFINITIONS[step];

    if (stepDefinition.kind !== GettingStartedStepKind.WORKFLOW) {
      throw new GettingStartedException(
        `Step ${step} is not a workflow step`,
        GettingStartedExceptionCode.INVALID_STEP,
      );
    }

    const workflowKey =
      `${GETTING_STARTED_WORKFLOW_USER_VAR_KEY_PREFIX}${step}` as const;

    return this.cacheLockService.withLock(
      async () => {
        const savedWorkflow = await this.userVarsService.get({
          workspaceId,
          key: workflowKey,
        });

        const savedCoreWorkflow = isDefined(savedWorkflow)
          ? await this.coreWorkflowListService.findOneById({
              workspaceId,
              userWorkspaceId,
              coreWorkflowId: savedWorkflow.workflowId,
            })
          : null;

        const workflow = isDefined(savedCoreWorkflow)
          ? savedWorkflow
          : await this.createWorkflowDraftOrThrow({
              workspaceId,
              userWorkspaceId,
              workflowKey,
              workflowTemplate: stepDefinition.workflowTemplate,
            });

        if (!activate) {
          return workflow;
        }

        const isWorkflowActive =
          savedCoreWorkflow?.statuses.includes(WorkflowStatus.ACTIVE) ?? false;

        if (!isWorkflowActive) {
          await this.coreWorkflowLifecycleWorkspaceService.activateCoreWorkflowVersion(
            {
              workspaceId,
              userWorkspaceId,
              coreWorkflowVersionId: workflow.versionId,
            },
          );
        }

        await this.gettingStartedService.completeStep({
          userId,
          workspaceId,
          step,
        });

        return workflow;
      },
      `getting-started-workflow:${workspaceId}:${step}`,
      { ttl: 30_000 },
    );
  }

  private async createWorkflowDraftOrThrow({
    workspaceId,
    userWorkspaceId,
    workflowKey,
    workflowTemplate,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    workflowKey: `${typeof GETTING_STARTED_WORKFLOW_USER_VAR_KEY_PREFIX}${GettingStartedStep}`;
    workflowTemplate: GettingStartedWorkflowTemplate;
  }): Promise<GettingStartedWorkflowDTO> {
    const mailboxes =
      await this.connectedAccountMetadataService.findMailboxesUsableByCaller({
        workspaceId,
        userWorkspaceId,
        operation: EmailOperation.SEND,
      });

    const mailbox = mailboxes.find(
      (usableMailbox) => usableMailbox.scope === 'USER',
    );

    if (!isDefined(mailbox)) {
      throw new GettingStartedException(
        `No mailbox can send the workflow emails for user workspace ${userWorkspaceId}`,
        GettingStartedExceptionCode.MAILBOX_NOT_CONNECTED,
      );
    }

    const { flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps'],
        },
      );

    const { coreWorkflow, coreWorkflowVersionId } =
      await this.coreWorkflowMutationWorkspaceService.createWorkflowWithContent(
        {
          workspaceId,
          userWorkspaceId,
          name: workflowTemplate.name,
          ...workflowTemplate.buildWorkflow({
            connectedAccountId: mailbox.id,
            flatFieldMetadataMaps,
          }),
        },
      );

    const workflow = {
      workflowId: coreWorkflow.id,
      versionId: coreWorkflowVersionId,
    };

    await this.userVarsService.set({
      workspaceId,
      key: workflowKey,
      value: workflow,
    });

    return workflow;
  }
}
