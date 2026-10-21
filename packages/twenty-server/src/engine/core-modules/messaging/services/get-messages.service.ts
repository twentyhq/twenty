import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { TIMELINE_THREADS_DEFAULT_PAGE_SIZE } from 'src/engine/core-modules/messaging/constants/messaging.constants';
import { type TimelineThreadSearchResultDTO } from 'src/engine/core-modules/messaging/dtos/timeline-thread-search-result.dto';
import { type TimelineThreadDTO } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';
import { type TimelineThreadsWithTotalDTO } from 'src/engine/core-modules/messaging/dtos/timeline-threads-with-total.dto';
import { TimelineMessagingService } from 'src/engine/core-modules/messaging/services/timeline-messaging.service';
import { formatThreads } from 'src/engine/core-modules/messaging/utils/format-threads.util';
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

  async getMessagesFromPersonIds(
    workspaceMemberId: string,
    personIds: string[],
    workspaceId: string,
    page = 1,
    pageSize: number = TIMELINE_THREADS_DEFAULT_PAGE_SIZE,
    targetFilter?: TargetFilter,
  ): Promise<TimelineThreadsWithTotalDTO> {
    const offset = (page - 1) * pageSize;

    const { messageThreads, totalNumberOfThreads } =
      await this.timelineMessagingService.getAndCountMessageThreads(
        personIds,
        workspaceId,
        offset,
        pageSize,
        targetFilter,
      );

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
        workspaceMemberId,
        workspaceId,
      }),
      relatedPersonIds: personIds,
    };
  }

  async searchMessagesFromObjectRecord({
    workspaceMemberId,
    objectNameSingular,
    recordId,
    workspaceId,
    searchInput,
    limit = TIMELINE_THREADS_DEFAULT_PAGE_SIZE,
  }: {
    workspaceMemberId: string;
    objectNameSingular: string;
    recordId: string;
    workspaceId: string;
    searchInput?: string;
    limit?: number;
  }): Promise<TimelineThreadSearchResultDTO> {
    if (!isNonEmptyString(searchInput?.trim())) {
      const { timelineThreads } = await this.getMessagesFromObjectRecord(
        workspaceMemberId,
        objectNameSingular,
        recordId,
        workspaceId,
        1,
        limit,
      );

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
      this.timelineMessagingService.getSearchableMessageChannelIds(
        workspaceMemberId,
        workspaceId,
      ),
    ]);

    // Only channels sharing at least the subject are searched, so a match never reveals a hidden subject
    const recordMessageThreads =
      await this.timelineMessagingService.searchMessageThreads({
        workspaceId,
        searchInput,
        messageChannelIds: subjectVisibleMessageChannelIds,
        recordFilter: { targetFilter, personIds },
        limit,
      });

    // The fallback searches only the viewer's own mailboxes, as nothing else narrows it down
    const otherMessageThreads =
      await this.timelineMessagingService.searchMessageThreads({
        workspaceId,
        searchInput,
        messageChannelIds: ownedMessageChannelIds,
        excludedMessageThreadIds: recordMessageThreads.map(({ id }) => id),
        limit,
      });

    const [recordTimelineThreads, otherTimelineThreads] = await Promise.all([
      this.formatTimelineThreads({
        messageThreads: recordMessageThreads,
        workspaceMemberId,
        workspaceId,
      }),
      this.formatTimelineThreads({
        messageThreads: otherMessageThreads,
        workspaceMemberId,
        workspaceId,
      }),
    ]);

    return { recordTimelineThreads, otherTimelineThreads };
  }

  private async formatTimelineThreads({
    messageThreads,
    workspaceMemberId,
    workspaceId,
  }: {
    messageThreads: Parameters<typeof formatThreads>[0];
    workspaceMemberId: string;
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

    const threadVisibilityByThreadId =
      await this.timelineMessagingService.getThreadVisibilityByThreadId(
        messageThreadIds,
        workspaceMemberId,
        workspaceId,
      );

    return formatThreads(
      messageThreads,
      threadParticipantsByThreadId,
      threadVisibilityByThreadId,
    );
  }

  async getMessagesFromObjectRecord(
    workspaceMemberId: string,
    objectNameSingular: string,
    recordId: string,
    workspaceId: string,
    page = 1,
    pageSize: number = TIMELINE_THREADS_DEFAULT_PAGE_SIZE,
  ): Promise<TimelineThreadsWithTotalDTO> {
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

    return this.getMessagesFromPersonIds(
      workspaceMemberId,
      personIds,
      workspaceId,
      page,
      pageSize,
      targetFilter,
    );
  }
}
