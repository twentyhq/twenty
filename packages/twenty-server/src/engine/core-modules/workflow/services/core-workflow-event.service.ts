import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { type CoreWorkflowBroadcastOperation } from 'src/engine/core-modules/workflow/types/core-workflow-broadcast-operation.type';
import { buildCoreWorkflowBroadcastEvent } from 'src/engine/core-modules/workflow/utils/build-core-workflow-broadcast-event.util';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';

type CoreWorkflowEventInput = {
  operation: CoreWorkflowBroadcastOperation;
  coreWorkflowId?: string | null;
  coreWorkflowVersionId?: string | null;
};

// Writes that must stay inside a single workspace transaction (version
// activation, which enables the automated trigger in the same transaction)
// cannot go through the migration runner, so they broadcast the same
// workflow / workflowVersion events the runner emits for every other write.
@Injectable()
export class CoreWorkflowEventService {
  constructor(
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  publishWorkflowEvents({
    workspaceId,
    events,
  }: {
    workspaceId: string;
    events: CoreWorkflowEventInput[];
  }): void {
    const broadcastEvents = events
      .map((event) => buildCoreWorkflowBroadcastEvent(event))
      .filter(isDefined);

    if (!isNonEmptyArray(broadcastEvents)) {
      return;
    }

    void this.workspaceEventBroadcaster
      .broadcast({ workspaceId, events: broadcastEvents })
      .catch((error) => {
        this.exceptionHandlerService.captureExceptions([error], {
          additionalData: { workspaceId, eventCount: broadcastEvents.length },
        });
      });
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
}
