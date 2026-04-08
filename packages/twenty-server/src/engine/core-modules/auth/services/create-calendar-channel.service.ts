import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';
import { EntityManager } from 'typeorm';

import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  CalendarChannelVisibility,
} from 'twenty-shared/types';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

export type CreateCalendarChannelInput = {
  workspaceId: string;
  connectedAccountId: string;
  handle: string;
  calendarVisibility?: CalendarChannelVisibility;
  skipMessageChannelConfiguration?: boolean;
  transactionManager: EntityManager;
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
      skipMessageChannelConfiguration,
      transactionManager,
    } = input;

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const newCalendarChannelId = v4();

        await transactionManager.getRepository(CalendarChannelEntity).save({
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
          workspaceId,
        } as CalendarChannelEntity);

        return newCalendarChannelId;
      },
      authContext,
    );
  }
}
