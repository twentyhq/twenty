import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
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
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
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

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const calendarChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarChannelWorkspaceEntity>(
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
      },
    );
  }
}
