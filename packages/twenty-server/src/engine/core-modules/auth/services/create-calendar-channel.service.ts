import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
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
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    @InjectRepository(ObjectMetadataEntity, 'core')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
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

    const calendarChannelMetadata =
      await this.objectMetadataRepository.findOneOrFail({
        where: { nameSingular: 'calendarChannel', workspaceId },
      });

    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: 'calendarChannel',
      action: DatabaseEventAction.CREATED,
      events: [
        {
          recordId: newCalendarChannel.id,
          objectMetadata: calendarChannelMetadata,
          properties: {
            after: newCalendarChannel,
          },
        },
      ],
      workspaceId,
    });

    return newCalendarChannel.id;
  }
}
