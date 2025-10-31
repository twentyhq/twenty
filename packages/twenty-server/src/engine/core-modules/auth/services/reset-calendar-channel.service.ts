import { Injectable } from '@nestjs/common';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  CalendarChannelSyncStage,
  type CalendarChannelWorkspaceEntity,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

export type ResetCalendarChannelsInput = {
  workspaceId: string;
  connectedAccountId: string;
  manager: WorkspaceEntityManager;
};

@Injectable()
export class ResetCalendarChannelService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async resetCalendarChannels(
    input: ResetCalendarChannelsInput,
  ): Promise<void> {
    const { workspaceId, connectedAccountId, manager } = input;

    const calendarChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<CalendarChannelWorkspaceEntity>(
        workspaceId,
        'calendarChannel',
      );

    await calendarChannelRepository.update(
      {
        connectedAccountId,
      },
      {
        syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
        syncStatus: null,
        syncCursor: '',
        syncStageStartedAt: null,
      },
      manager,
    );

    return;
  }
}
