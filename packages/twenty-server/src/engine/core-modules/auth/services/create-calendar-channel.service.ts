import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  CalendarChannelVisibility,
  CalendarChannelWorkspaceEntity,
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
      },
      {},
      manager,
    );

    return newCalendarChannel.id;
  }
}
