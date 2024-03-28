import { ForbiddenException, Injectable } from '@nestjs/common';

import groupBy from 'lodash.groupby';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { CalendarChannelRepository } from 'src/apps/calendar/repositories/calendar-channel.repository';
import { CalendarChannelEventAssociationObjectMetadata } from 'src/apps/calendar/standard-objects/calendar-channel-event-association.object-metadata';
import {
  CalendarChannelObjectMetadata,
  CalendarChannelVisibility,
} from 'src/apps/calendar/standard-objects/calendar-channel.object-metadata';
import { ConnectedAccountRepository } from 'src/apps/connected-account/repositories/connected-account.repository';
import { ConnectedAccountObjectMetadata } from 'src/apps/connected-account/standard-objects/connected-account.object-metadata';
import { WorkspaceMemberRepository } from 'src/apps/workspace-member/repositories/workspace-member.repository';
import { WorkspaceMemberObjectMetadata } from 'src/apps/workspace-member/standard-objects/workspace-member.object-metadata';

@Injectable()
export class CanAccessCalendarEventService {
  constructor(
    @InjectObjectMetadataRepository(CalendarChannelObjectMetadata)
    private readonly calendarChannelRepository: CalendarChannelRepository,
    @InjectObjectMetadataRepository(ConnectedAccountObjectMetadata)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(WorkspaceMemberObjectMetadata)
    private readonly workspaceMemberService: WorkspaceMemberRepository,
  ) {}

  public async canAccessCalendarEvent(
    userId: string,
    workspaceId: string,
    calendarChannelCalendarEventAssociations: ObjectRecord<CalendarChannelEventAssociationObjectMetadata>[],
  ) {
    const calendarChannels = await this.calendarChannelRepository.getByIds(
      calendarChannelCalendarEventAssociations.map(
        (association) => association.calendarChannelId,
      ),
      workspaceId,
    );

    const calendarChannelsGroupByVisibility = groupBy(
      calendarChannels,
      (channel) => channel.visibility,
    );

    if (
      calendarChannelsGroupByVisibility[
        CalendarChannelVisibility.SHARE_EVERYTHING
      ]
    ) {
      return;
    }

    const currentWorkspaceMember =
      await this.workspaceMemberService.getByIdOrFail(userId, workspaceId);

    const calendarChannelsConnectedAccounts =
      await this.connectedAccountRepository.getByIds(
        calendarChannels.map((channel) => channel.connectedAccountId),
        workspaceId,
      );

    const calendarChannelsWorkspaceMemberIds =
      calendarChannelsConnectedAccounts.map(
        (connectedAccount) => connectedAccount.accountOwnerId,
      );

    if (
      calendarChannelsWorkspaceMemberIds.includes(currentWorkspaceMember.id)
    ) {
      return;
    }

    throw new ForbiddenException();
  }
}
