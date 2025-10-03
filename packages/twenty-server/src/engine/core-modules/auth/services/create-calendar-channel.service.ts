import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  CalendarChannelVisibility,
  type CalendarChannelWorkspaceEntity,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

export type CreateCalendarChannelInput = {
  workspaceId: string;
  connectedAccountId: string;
  handle: string;
  calendarVisibility?: CalendarChannelVisibility;
  manager: WorkspaceEntityManager;
};

@Injectable()
export class CreateCalendarChannelService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async createCalendarChannel(
    input: CreateCalendarChannelInput,
  ): Promise<string> {
    const {
      workspaceId,
      connectedAccountId,
      handle,
      calendarVisibility,
      manager,
    } = input;

    const calendarChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<CalendarChannelWorkspaceEntity>(
        workspaceId,
        'calendarChannel',
      );

    const newCalendarChannel = await calendarChannelRepository.save(
      {
        id: v4(),
        connectedAccountId,
        handle,
        visibility:
          calendarVisibility || CalendarChannelVisibility.SHARE_EVERYTHING,
        syncStatus: CalendarChannelSyncStatus.NOT_SYNCED,
        syncStage: CalendarChannelSyncStage.PENDING_CONFIGURATION,
      },
      {},
      manager,
    );

    return newCalendarChannel.id;
  }
}
