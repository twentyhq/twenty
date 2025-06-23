import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import {
  CalendarChannelSyncStage,
  CalendarChannelWorkspaceEntity,
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
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    @InjectRepository(ObjectMetadataEntity, 'core')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
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

    const calendarChannels = await calendarChannelRepository.find({
      where: { connectedAccountId },
    });

    const calendarChannelUpdates = await calendarChannelRepository.update(
      {
        connectedAccountId,
      },
      {
        syncStage:
          CalendarChannelSyncStage.FULL_CALENDAR_EVENT_LIST_FETCH_PENDING,
        syncStatus: null,
        syncCursor: '',
        syncStageStartedAt: null,
      },
      manager,
    );

    const calendarChannelMetadata =
      await this.objectMetadataRepository.findOneOrFail({
        where: { nameSingular: 'calendarChannel', workspaceId },
      });

    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: 'calendarChannel',
      action: DatabaseEventAction.UPDATED,
      events: calendarChannels.map((calendarChannel) => ({
        recordId: calendarChannel.id,
        objectMetadata: calendarChannelMetadata,
        properties: {
          before: calendarChannel,
          after: {
            ...calendarChannel,
            ...calendarChannelUpdates.raw[0],
          },
        },
      })),
      workspaceId,
    });

    return;
  }
}
