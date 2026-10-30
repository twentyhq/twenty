import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { GETTING_STARTED_WORKFLOWS } from 'src/engine/core-modules/getting-started/constants/getting-started-workflows.constant';
import { type GettingStartedWorkflowDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-workflow.dto';
import { type GettingStartedStepActionKey } from 'src/engine/core-modules/getting-started/enums/getting-started-step-action-key.enum';
import {
  GettingStartedException,
  GettingStartedExceptionCode,
} from 'src/engine/core-modules/getting-started/getting-started.exception';
import {
  GETTING_STARTED_WORKFLOW_USER_VAR_KEY_PREFIX,
  type GettingStartedKeyValueTypeMap,
} from 'src/engine/core-modules/getting-started/types/getting-started-key-value-type-map.type';
import { type GettingStartedWorkflow } from 'src/engine/core-modules/getting-started/types/getting-started-workflow.type';
import { buildGettingStartedWorkflowContent } from 'src/engine/core-modules/getting-started/utils/build-getting-started-workflow-content.util';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { CoreWorkflowListService } from 'src/engine/core-modules/workflow/services/core-workflow-list.service';
import { CoreWorkflowMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-mutation.workspace-service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';

@Injectable()
export class GettingStartedWorkflowWorkspaceService {
  constructor(
    private readonly userVarsService: UserVarsService<GettingStartedKeyValueTypeMap>,
    private readonly cacheLockService: CacheLockService,
    private readonly coreWorkflowListService: CoreWorkflowListService,
    private readonly coreWorkflowMutationWorkspaceService: CoreWorkflowMutationWorkspaceService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async prepareWorkflowOrThrow({
    workspaceId,
    userWorkspaceId,
    stepActionKey,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    stepActionKey: GettingStartedStepActionKey;
  }): Promise<GettingStartedWorkflowDTO> {
    const gettingStartedWorkflow = GETTING_STARTED_WORKFLOWS[stepActionKey];

    if (!isDefined(gettingStartedWorkflow)) {
      throw new GettingStartedException(
        `Step ${stepActionKey} has no workflow`,
        GettingStartedExceptionCode.INVALID_STEP,
      );
    }

    return this.cacheLockService.withLock(
      async () => {
        const savedWorkflow = await this.userVarsService.get({
          workspaceId,
          key: `${GETTING_STARTED_WORKFLOW_USER_VAR_KEY_PREFIX}${stepActionKey}`,
        });

        const savedCoreWorkflow = isDefined(savedWorkflow)
          ? await this.coreWorkflowListService.findOneById({
              workspaceId,
              userWorkspaceId,
              coreWorkflowId: savedWorkflow.workflowId,
            })
          : null;

        if (isDefined(savedCoreWorkflow)) {
          return savedWorkflow;
        }

        return this.createWorkflowDraft({
          workspaceId,
          userWorkspaceId,
          stepActionKey,
          gettingStartedWorkflow,
        });
      },
      `getting-started-workflow:${workspaceId}:${stepActionKey}`,
      { ttl: 30_000 },
    );
  }

  private async createWorkflowDraft({
    workspaceId,
    userWorkspaceId,
    stepActionKey,
    gettingStartedWorkflow,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    stepActionKey: GettingStartedStepActionKey;
    gettingStartedWorkflow: GettingStartedWorkflow;
  }): Promise<GettingStartedWorkflowDTO> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const { coreWorkflow, coreWorkflowVersionId } =
      await this.coreWorkflowMutationWorkspaceService.createWorkflowWithContent(
        {
          workspaceId,
          userWorkspaceId,
          ...buildGettingStartedWorkflowContent({
            gettingStartedWorkflow,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
          }),
          edges: [],
        },
      );

    const workflow = {
      workflowId: coreWorkflow.id,
      versionId: coreWorkflowVersionId,
    };

    await this.userVarsService.set({
      workspaceId,
      key: `${GETTING_STARTED_WORKFLOW_USER_VAR_KEY_PREFIX}${stepActionKey}`,
      value: workflow,
    });

    return workflow;
  }
}
