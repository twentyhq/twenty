import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { DeferredDatabaseEventTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/services/deferred-database-event-trigger.service';
import { WORKSPACE_SIGNAL_CLEARED_EVENT } from 'src/engine/core-modules/workspace-signal/constants/workspace-signal-cleared-event.constant';
import { type WorkspaceSignalClearedEvent } from 'src/engine/core-modules/workspace-signal/types/workspace-signal-cleared-event.type';

@Injectable()
export class DeferredDatabaseEventTriggerListener {
  private readonly logger = new Logger(
    DeferredDatabaseEventTriggerListener.name,
  );

  constructor(
    private readonly deferredDatabaseEventTriggerService: DeferredDatabaseEventTriggerService,
  ) {}

  @OnEvent(WORKSPACE_SIGNAL_CLEARED_EVENT)
  async handleWorkspaceSignalCleared({
    workspaceId,
    name,
  }: WorkspaceSignalClearedEvent): Promise<void> {
    try {
      await this.deferredDatabaseEventTriggerService.flush({
        workspaceId,
        signal: name,
      });
    } catch (error) {
      this.logger.error(
        `Failed to flush triggers deferred on signal ${name} in workspace ${workspaceId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
