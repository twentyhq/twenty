import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { EmailOperation } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { GETTING_STARTED_HANDOVER_USER_VAR_KEY } from 'src/engine/core-modules/getting-started/constants/getting-started-handover-user-var-key.constant';
import { type GettingStartedHandoverDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-handover.dto';
import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import {
  GettingStartedException,
  GettingStartedExceptionCode,
} from 'src/engine/core-modules/getting-started/getting-started.exception';
import { GettingStartedService } from 'src/engine/core-modules/getting-started/services/getting-started.service';
import { type GettingStartedKeyValueTypeMap } from 'src/engine/core-modules/getting-started/types/getting-started-key-value-type-map.type';
import { buildHandoverWorkflow } from 'src/engine/core-modules/getting-started/utils/build-handover-workflow.util';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { WorkflowStatus } from 'src/engine/core-modules/workflow/enums/workflow-status.enum';
import { CoreWorkflowLifecycleWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-lifecycle.workspace-service';
import { CoreWorkflowListService } from 'src/engine/core-modules/workflow/services/core-workflow-list.service';
import { CoreWorkflowMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-mutation.workspace-service';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';

@Injectable()
export class GettingStartedHandoverWorkspaceService {
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

  async prepareHandover({
    userId,
    workspaceId,
    userWorkspaceId,
    activate,
  }: {
    userId: string;
    workspaceId: string;
    userWorkspaceId: string;
    activate: boolean;
  }): Promise<GettingStartedHandoverDTO> {
    return this.cacheLockService.withLock(
      async () => {
        const savedHandover = await this.userVarsService.get({
          workspaceId,
          key: GETTING_STARTED_HANDOVER_USER_VAR_KEY,
        });

        const savedCoreWorkflow = isDefined(savedHandover)
          ? await this.coreWorkflowListService.findOneById({
              workspaceId,
              userWorkspaceId,
              coreWorkflowId: savedHandover.workflowId,
            })
          : null;

        const handover = isDefined(savedCoreWorkflow)
          ? savedHandover
          : await this.createHandoverDraftOrThrow({
              workspaceId,
              userWorkspaceId,
            });

        if (!activate) {
          return handover;
        }

        const isHandoverActive =
          savedCoreWorkflow?.statuses.includes(WorkflowStatus.ACTIVE) ?? false;

        if (!isHandoverActive) {
          await this.coreWorkflowLifecycleWorkspaceService.activateCoreWorkflowVersion(
            {
              workspaceId,
              userWorkspaceId,
              coreWorkflowVersionId: handover.versionId,
            },
          );
        }

        await this.gettingStartedService.completeStep({
          userId,
          workspaceId,
          step: GettingStartedStep.HANDOVER_DEALS,
        });

        return handover;
      },
      `getting-started-handover:${workspaceId}`,
      { ttl: 30_000 },
    );
  }

  private async createHandoverDraftOrThrow({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<GettingStartedHandoverDTO> {
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
        `No mailbox can send the handover email for user workspace ${userWorkspaceId}`,
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

    const companyIdFieldId = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      universalIdentifier:
        STANDARD_OBJECTS.company.fields.id.universalIdentifier,
    }).id;

    const memberIdFieldId = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      universalIdentifier:
        STANDARD_OBJECTS.workspaceMember.fields.id.universalIdentifier,
    }).id;

    const opportunityStageFieldId = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      universalIdentifier:
        STANDARD_OBJECTS.opportunity.fields.stage.universalIdentifier,
    }).id;

    const { coreWorkflow, coreWorkflowVersionId } =
      await this.coreWorkflowMutationWorkspaceService.createWorkflowWithContent(
        {
          workspaceId,
          userWorkspaceId,
          name: 'Hand over won deals',
          ...buildHandoverWorkflow({
            connectedAccountId: mailbox.id,
            companyIdFieldId,
            memberIdFieldId,
            opportunityStageFieldId,
          }),
        },
      );

    const handover = {
      workflowId: coreWorkflow.id,
      versionId: coreWorkflowVersionId,
    };

    await this.userVarsService.set({
      workspaceId,
      key: GETTING_STARTED_HANDOVER_USER_VAR_KEY,
      value: handover,
    });

    return handover;
  }
}
