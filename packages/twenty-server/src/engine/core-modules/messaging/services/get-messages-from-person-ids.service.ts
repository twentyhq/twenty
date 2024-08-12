import { Injectable } from '@nestjs/common';

import { TIMELINE_THREADS_DEFAULT_PAGE_SIZE } from 'src/engine/core-modules/messaging/constants/messaging.constants';
import { TimelineThreadsWithTotal } from 'src/engine/core-modules/messaging/dtos/timeline-threads-with-total.dto';
import { TimelineMessagingService } from 'src/engine/core-modules/messaging/services/timeline-messaging.service';
import { formatThreads } from 'src/engine/core-modules/messaging/utils/format-threads.util';

@Injectable()
export class GetMessagesFromPersonIdsService {
  constructor(
    private readonly timelineMessagingService: TimelineMessagingService,
  ) {}

  async getMessagesFromPersonIds(
    workspaceMemberId: string,
    personIds: string[],
    page = 1,
    pageSize: number = TIMELINE_THREADS_DEFAULT_PAGE_SIZE,
  ): Promise<TimelineThreadsWithTotal> {
    const offset = (page - 1) * pageSize;

    const { messageThreads, totalNumberOfThreads } =
      await this.timelineMessagingService.getAndCountMessageThreads(
        personIds,
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
      );

    const threadVisibilityByThreadId =
      await this.timelineMessagingService.getThreadVisibilityByThreadId(
        messageThreadIds,
        workspaceMemberId,
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
}
