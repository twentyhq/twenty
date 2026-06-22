import { Injectable } from '@nestjs/common';

import { TIMELINE_THREADS_DEFAULT_PAGE_SIZE } from 'src/engine/core-modules/messaging/constants/messaging.constants';
import { type TimelineThreadsWithTotalDTO } from 'src/engine/core-modules/messaging/dtos/timeline-threads-with-total.dto';
import { TimelineMessagingService } from 'src/engine/core-modules/messaging/services/timeline-messaging.service';
import { formatThreads } from 'src/engine/core-modules/messaging/utils/format-threads.util';
import { RelatedPersonIdsService } from 'src/engine/core-modules/related-person-ids/services/related-person-ids.service';

@Injectable()
export class GetMessagesService {
  constructor(
    private readonly timelineMessagingService: TimelineMessagingService,
    private readonly relatedPersonIdsService: RelatedPersonIdsService,
  ) {}

  async getMessagesFromPersonIds(
    workspaceMemberId: string,
    personIds: string[],
    workspaceId: string,
    page = 1,
    pageSize: number = TIMELINE_THREADS_DEFAULT_PAGE_SIZE,
  ): Promise<TimelineThreadsWithTotalDTO> {
    const offset = (page - 1) * pageSize;

    const { messageThreads, totalNumberOfThreads } =
      await this.timelineMessagingService.getAndCountMessageThreads(
        personIds,
        workspaceId,
        offset,
        pageSize,
      );

    if (!messageThreads) {
      return {
        totalNumberOfThreads: 0,
        timelineThreads: [],
      };
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

    return {
      totalNumberOfThreads,
      timelineThreads: formatThreads(
        messageThreads,
        threadParticipantsByThreadId,
        threadVisibilityByThreadId,
      ),
    };
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

    if (personIds.length === 0) {
      return {
        totalNumberOfThreads: 0,
        timelineThreads: [],
      };
    }

    return this.getMessagesFromPersonIds(
      workspaceMemberId,
      personIds,
      workspaceId,
      page,
      pageSize,
    );
  }
}
