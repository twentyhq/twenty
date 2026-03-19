import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { CalendarChannelDataAccessService } from 'src/engine/metadata-modules/calendar-channel/data-access/services/calendar-channel-data-access.service';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  CalendarChannelVisibility,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

export type CreateCalendarChannelInput = {
  workspaceId: string;
  connectedAccountId: string;
  handle: string;
  calendarVisibility?: CalendarChannelVisibility;
  manager: WorkspaceEntityManager;
  skipMessageChannelConfiguration?: boolean;
};

@Injectable()
export class CreateCalendarChannelService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly calendarChannelDataAccessService: CalendarChannelDataAccessService,
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
      skipMessageChannelConfiguration,
    } = input;

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const newCalendarChannelId = v4();

        await this.calendarChannelDataAccessService.save(
          workspaceId,
          {
            id: newCalendarChannelId,
            connectedAccountId,
            handle,
            visibility:
              calendarVisibility || CalendarChannelVisibility.SHARE_EVERYTHING,
            syncStatus: skipMessageChannelConfiguration
              ? CalendarChannelSyncStatus.ONGOING
              : CalendarChannelSyncStatus.NOT_SYNCED,
            syncStage: skipMessageChannelConfiguration
              ? CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING
              : CalendarChannelSyncStage.PENDING_CONFIGURATION,
          },
          manager,
        );

        return newCalendarChannelId;
      },
      authContext,
    );
  }
}
