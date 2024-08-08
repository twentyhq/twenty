import { Injectable } from '@nestjs/common';

import { Any } from 'typeorm';

import { TIMELINE_THREADS_DEFAULT_PAGE_SIZE } from 'src/engine/core-modules/messaging/constants/messaging.constants';
import { TimelineThreadsWithTotal } from 'src/engine/core-modules/messaging/dtos/timeline-threads-with-total.dto';
import { TimelineMessagingService } from 'src/engine/core-modules/messaging/services/timeline-messaging.service';
import { formatThreadParticipant } from 'src/engine/core-modules/messaging/utils/format-thread-participant.util';
import { formatThreads } from 'src/engine/core-modules/messaging/utils/format-threads.util';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';

@Injectable()
export class GetMessagesFromPersonIdsService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly timelineMessagingService: TimelineMessagingService,
  ) {}

  async getMessagesFromPersonIds(
    workspaceMemberId: string,
    personIds: string[],
    page = 1,
    pageSize: number = TIMELINE_THREADS_DEFAULT_PAGE_SIZE,
  ): Promise<TimelineThreadsWithTotal> {
    const offset = (page - 1) * pageSize;

    const messageThreadRepository =
      await this.twentyORMManager.getRepository<MessageThreadWorkspaceEntity>(
        'messageThread',
      );

    const messageThreads =
      await this.timelineMessagingService.getMessageThreads(
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

    const totalNumberOfThreads = await messageThreadRepository.count({
      where: {
        messages: {
          messageParticipants: {
            personId: Any(personIds),
          },
        },
      },
    });

    const messageParticipantRepository =
      await this.twentyORMManager.getRepository<MessageParticipantWorkspaceEntity>(
        'messageParticipant',
      );

    const threadParticipants = await messageParticipantRepository.find({
      where: {
        message: {
          messageThreadId: Any(messageThreadIds),
        },
      },
      order: {
        message: {
          receivedAt: 'DESC',
        },
      },
      relations: ['person', 'workspaceMember', 'message'],
    });

    const threadParticipantsByThreadId: {
      [key: string]: MessageParticipantWorkspaceEntity[];
    } = threadParticipants.reduce(
      (threadParticipantsAcc, threadParticipant) => {
        if (!threadParticipant.message.messageThreadId)
          return threadParticipantsAcc;
        if (!threadParticipantsAcc[threadParticipant.message.messageThreadId])
          threadParticipantsAcc[threadParticipant.message.messageThreadId] = [];

        threadParticipantsAcc[threadParticipant.message.messageThreadId].push(
          formatThreadParticipant(threadParticipant),
        );

        return threadParticipantsAcc;
      },
      {},
    );

    const threadVisibilityByThreadId =
      await this.timelineMessagingService.getThreadVisibilityByThreadId(
        messageThreadIds,
        threadParticipantsByThreadId,
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
