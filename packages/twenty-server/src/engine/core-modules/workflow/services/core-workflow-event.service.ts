import { Injectable } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { type CoreWorkflowBroadcastOperation } from 'src/engine/core-modules/workflow/types/core-workflow-broadcast-operation.type';
import { buildCoreWorkflowBroadcastEvent } from 'src/engine/core-modules/workflow/utils/build-core-workflow-broadcast-event.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { resolveUserWorkspaceIdsWithPermissionFlag } from 'src/engine/metadata-modules/permissions/utils/resolve-user-workspace-ids-with-permission-flag.util';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';

type CoreWorkflowEventInput = {
  operation: CoreWorkflowBroadcastOperation;
  coreWorkflowId?: string | null;
  coreWorkflowVersionId?: string | null;
};

@Injectable()
export class CoreWorkflowEventService {
  constructor(
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  publishWorkflowEvents({
    workspaceId,
    events,
  }: {
    workspaceId: string;
    events: CoreWorkflowEventInput[];
  }): void {
    void this.broadcastWorkflowEvents({ workspaceId, events }).catch(
      (error) => {
        this.exceptionHandlerService.captureExceptions([error], {
          additionalData: { workspaceId, eventCount: events.length },
        });
      },
    );
  }

  publishWorkflowEventsAfterCommit({
    workspaceId,
    transactionScope,
    events,
  }: {
    workspaceId: string;
    transactionScope: WorkspaceTransactionScope;
    events: CoreWorkflowEventInput[];
  }): void {
    transactionScope.afterCommit(() => {
      this.publishWorkflowEvents({ workspaceId, events });
    });
  }

  private async broadcastWorkflowEvents({
    workspaceId,
    events,
  }: {
    workspaceId: string;
    events: CoreWorkflowEventInput[];
  }): Promise<void> {
    if (!isNonEmptyArray(events)) {
      return;
    }

    const recipientUserWorkspaceIds =
      await this.resolveRecipientUserWorkspaceIds(workspaceId);

    if (!isNonEmptyArray(recipientUserWorkspaceIds)) {
      return;
    }

    const broadcastEvents = events
      .map((event) =>
        buildCoreWorkflowBroadcastEvent({
          ...event,
          recipientUserWorkspaceIds,
        }),
      )
      .filter(isDefined);

    await this.workspaceEventBroadcaster.broadcast({
      workspaceId,
      events: broadcastEvents,
    });
  }

  private async resolveRecipientUserWorkspaceIds(
    workspaceId: string,
  ): Promise<string[]> {
    const { flatRoleMaps, flatRolePermissionFlagMaps, flatRoleTargetMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatRoleMaps',
            'flatPermissionFlagMaps',
            'flatRolePermissionFlagMaps',
            'flatRoleTargetMaps',
          ],
        },
      );

    return resolveUserWorkspaceIdsWithPermissionFlag({
      permissionFlag: PermissionFlagType.WORKFLOWS,
      flatRoleMaps,
      flatRolePermissionFlagMaps,
      flatRoleTargetMaps,
    });
  }
}
