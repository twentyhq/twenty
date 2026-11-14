import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { TIMELINE_THREADS_DEFAULT_PAGE_SIZE } from 'src/engine/core-modules/messaging/constants/messaging.constants';
import { type TimelineThreadChannelFilterInput } from 'src/engine/core-modules/messaging/dtos/timeline-thread-channel-filter.input';
import { type TimelineThreadChannelDTO } from 'src/engine/core-modules/messaging/dtos/timeline-thread-channel.dto';
import { type TimelineThreadSearchResultDTO } from 'src/engine/core-modules/messaging/dtos/timeline-thread-search-result.dto';
import { type TimelineThreadDTO } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';
import { type TimelineThreadsWithTotalDTO } from 'src/engine/core-modules/messaging/dtos/timeline-threads-with-total.dto';
import { TimelineMessagingService } from 'src/engine/core-modules/messaging/services/timeline-messaging.service';
import {
  type FormattableTimelineThread,
  formatThreads,
} from 'src/engine/core-modules/messaging/utils/format-threads.util';
import { RelatedPersonIdsService } from 'src/engine/core-modules/related-person-ids/services/related-person-ids.service';
import { type TargetFilter } from 'src/engine/core-modules/target/utils/get-target-field-name-for-object-record.util';
import { MessageCalendarTargetReadinessService } from 'src/engine/core-modules/target/services/message-calendar-target-readiness.service';

@Injectable()
export class GetMessagesService {
  constructor(
    private readonly timelineMessagingService: TimelineMessagingService,
    private readonly relatedPersonIdsService: RelatedPersonIdsService,
    private readonly messageCalendarTargetReadinessService: MessageCalendarTargetReadinessService,
  ) {}

  async getMessagesFromPersonIds({
    userWorkspaceId,
    personIds,
    workspaceId,
    page = 1,
    pageSize = TIMELINE_THREADS_DEFAULT_PAGE_SIZE,
    targetFilter,
    channel,
  }: {
    userWorkspaceId: string;
    personIds: string[];
    workspaceId: string;
    page?: number;
    pageSize?: number;
    targetFilter?: TargetFilter;
    channel?: TimelineThreadChannelFilterInput;
  }): Promise<TimelineThreadsWithTotalDTO> {
    const offset = (page - 1) * pageSize;

    const messageChannelIds = isDefined(channel)
      ? await this.timelineMessagingService.findMessageChannelIdsMatchingChannel(
          { workspaceId, channel },
        )
      : undefined;

    const { messageThreads, totalNumberOfThreads } =
      await this.timelineMessagingService.getAndCountMessageThreads({
        personIds,
        workspaceId,
        offset,
        pageSize,
        targetFilter,
        messageChannelIds,
      });

    if (!messageThreads) {
      return {
        totalNumberOfThreads: 0,
        timelineThreads: [],
        relatedPersonIds: personIds,
      };
    }

    return {
      totalNumberOfThreads,
      timelineThreads: await this.formatTimelineThreads({
        messageThreads,
        userWorkspaceId,
        workspaceId,
      }),
      relatedPersonIds: personIds,
    };
  }

  async searchMessagesFromObjectRecord({
    userWorkspaceId,
    objectNameSingular,
    recordId,
    workspaceId,
    searchInput,
  }: {
    userWorkspaceId: string;
    objectNameSingular: string;
    recordId: string;
    workspaceId: string;
    searchInput?: string;
  }): Promise<TimelineThreadSearchResultDTO> {
    if (!isNonEmptyString(searchInput?.trim())) {
      const { timelineThreads } = await this.getMessagesFromObjectRecord({
        userWorkspaceId,
        objectNameSingular,
        recordId,
        workspaceId,
      });

      return {
        recordTimelineThreads: timelineThreads,
        otherTimelineThreads: [],
      };
    }

    const [
      personIds,
      targetFilter,
      { ownedMessageChannelIds, subjectVisibleMessageChannelIds },
    ] = await Promise.all([
      this.relatedPersonIdsService.getRelatedPersonIds({
        workspaceId,
        objectNameSingular,
        recordId,
      }),
      this.messageCalendarTargetReadinessService.resolveTargetFilter({
        objectNameSingular,
        recordId,
        workspaceId,
      }),
      this.timelineMessagingService.getSearchableMessageChannelIds({
        userWorkspaceId,
        workspaceId,
      }),
    ]);

    // Only channels sharing at least the subject are searched, so a match never reveals a hidden subject
    const recordMessageThreads =
      await this.timelineMessagingService.searchMessageThreads({
        workspaceId,
        searchInput,
        messageChannelIds: subjectVisibleMessageChannelIds,
        recordFilter: { targetFilter, personIds },
      });

    // The fallback searches only the viewer's own mailboxes, as nothing else narrows it down
    const otherMessageThreads =
      await this.timelineMessagingService.searchMessageThreads({
        workspaceId,
        searchInput,
        messageChannelIds: ownedMessageChannelIds,
        excludedMessageThreadIds: recordMessageThreads.map(({ id }) => id),
      });

    const recordMessageThreadIds = new Set(
      recordMessageThreads.map(({ id }) => id),
    );

    const timelineThreads = await this.formatTimelineThreads({
      messageThreads: [...recordMessageThreads, ...otherMessageThreads],
      userWorkspaceId,
      workspaceId,
    });

    return {
      recordTimelineThreads: timelineThreads.filter(({ id }) =>
        recordMessageThreadIds.has(id),
      ),
      otherTimelineThreads: timelineThreads.filter(
        ({ id }) => !recordMessageThreadIds.has(id),
      ),
    };
  }

  private async formatTimelineThreads({
    messageThreads,
    userWorkspaceId,
    workspaceId,
  }: {
    messageThreads: FormattableTimelineThread[];
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<TimelineThreadDTO[]> {
    if (messageThreads.length === 0) {
      return [];
    }

    const messageThreadIds = messageThreads.map(
      (messageThread) => messageThread.id,
    );

    const threadParticipantsByThreadId =
      await this.timelineMessagingService.getThreadParticipantsByThreadId(
        messageThreadIds,
        workspaceId,
      );

    const [
      { threadVisibilityByThreadId, threadChannelByThreadId },
      unreadMessageThreadIds,
    ] = await Promise.all([
      this.timelineMessagingService.getThreadVisibilityAndChannelByThreadId({
        messageThreadIds,
        userWorkspaceId,
        workspaceId,
      }),
      this.timelineMessagingService.findUnreadMessageThreadIds({
        messageThreadIds,
        userWorkspaceId,
        workspaceId,
      }),
    ]);

    return formatThreads({
      threads: messageThreads,
      threadParticipantsByThreadId,
      threadVisibilityByThreadId,
      threadChannelByThreadId,
      unreadMessageThreadIds,
    });
  }

  async getMessagesFromObjectRecord({
    userWorkspaceId,
    objectNameSingular,
    recordId,
    workspaceId,
    page = 1,
    pageSize = TIMELINE_THREADS_DEFAULT_PAGE_SIZE,
    channel,
  }: {
    userWorkspaceId: string;
    objectNameSingular: string;
    recordId: string;
    workspaceId: string;
    page?: number;
    pageSize?: number;
    channel?: TimelineThreadChannelFilterInput;
  }): Promise<TimelineThreadsWithTotalDTO> {
    const personIds = await this.relatedPersonIdsService.getRelatedPersonIds({
      workspaceId,
      objectNameSingular,
      recordId,
    });
    const targetFilter =
      await this.messageCalendarTargetReadinessService.resolveTargetFilter({
        objectNameSingular,
        recordId,
        workspaceId,
      });

    if (!isDefined(targetFilter) && personIds.length === 0) {
      return {
        totalNumberOfThreads: 0,
        timelineThreads: [],
        relatedPersonIds: [],
      };
    }

    return this.getMessagesFromPersonIds({
      userWorkspaceId,
      personIds,
      workspaceId,
      page,
      pageSize,
      targetFilter,
      channel,
    });
  }

  async getChannelsFromObjectRecord({
    objectNameSingular,
    recordId,
    workspaceId,
  }: {
    objectNameSingular: string;
    recordId: string;
    workspaceId: string;
  }): Promise<TimelineThreadChannelDTO[]> {
    const [personIds, targetFilter] = await Promise.all([
      this.relatedPersonIdsService.getRelatedPersonIds({
        workspaceId,
        objectNameSingular,
        recordId,
      }),
      this.messageCalendarTargetReadinessService.resolveTargetFilter({
        objectNameSingular,
        recordId,
        workspaceId,
      }),
    ]);

    if (!isDefined(targetFilter) && personIds.length === 0) {
      return [];
    }

    return this.timelineMessagingService.getRecordThreadChannels({
      workspaceId,
      objectNameSingular,
      recordId,
      personIds,
      targetFilter,
    });
  }
}
