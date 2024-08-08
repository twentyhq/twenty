import { Injectable } from '@nestjs/common';

import { Any } from 'typeorm';

import { TimelineThread } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MessageChannelVisibility } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

type TimelineThreadParticipant = {
  personId: string;
  workspaceMemberId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl: string;
  handle: string;
};

@Injectable()
export class TimelineMessagingService {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  public async getMessageThreads(
    personIds: string[],
    offset: number,
    pageSize: number,
  ): Promise<
    Omit<
      TimelineThread,
      | 'firstParticipant'
      | 'lastTwoParticipants'
      | 'participantCount'
      | 'read'
      | 'visibility'
    >[]
  > {
    const messageThreadRepository =
      await this.twentyORMManager.getRepository<MessageThreadWorkspaceEntity>(
        'messageThread',
      );

    const messageThreads = await messageThreadRepository.find({
      where: {
        messages: {
          messageParticipants: {
            id: Any(personIds),
          },
        },
      },
      relations: ['messages', 'messages.messageParticipants'],
      order: {
        messages: {
          receivedAt: 'DESC',
        },
      },
      skip: offset,
      take: pageSize,
    });

    const messageThreadIds = messageThreads.map(
      (messageThread) => messageThread.id,
    );

    const messageRepository =
      await this.twentyORMManager.getRepository<MessageWorkspaceEntity>(
        'message',
      );

    const lastMessages = await messageRepository.find({
      where: {
        messageThreadId: Any(messageThreadIds),
      },
      order: {
        receivedAt: 'DESC',
      },
      take: 1,
    });

    const firstMessages = await messageRepository.find({
      where: {
        messageThreadId: Any(messageThreadIds),
      },
      order: {
        receivedAt: 'ASC',
      },
      take: 1,
    });

    const numberOfMessagesInThread = await messageRepository
      .createQueryBuilder('message')
      .select('message.messageThreadId', 'messageThreadId')
      .addSelect('COUNT(*)', 'messageCount')
      .groupBy('message.messageThreadId')
      .getRawMany();

    return messageThreads.map((messageThread) => {
      const lastMessage = lastMessages.find(
        (message) => message.messageThreadId === messageThread.id,
      );
      const firstMessage = firstMessages.find(
        (message) => message.messageThreadId === messageThread.id,
      );

      const messageCount = numberOfMessagesInThread.find(
        (messageCount) => messageCount.messageThreadId === messageThread.id,
      )?.messageCount;

      return {
        id: messageThread.id,
        subject: firstMessage?.subject ?? '',
        lastMessageBody: lastMessage?.text ?? '',
        lastMessageReceivedAt: lastMessage?.receivedAt ?? new Date(),
        numberOfMessagesInThread: messageCount,
      };
    });
  }

  public async getThreadVisibilityByThreadId(
    messageThreadIds: string[],
    threadParticipantsByThreadId: {
      [key: string]: MessageParticipantWorkspaceEntity[];
    },
    workspaceMemberId: string,
  ): Promise<{
    [key: string]: MessageChannelVisibility;
  }> {
    const messageThreadIdsForWhichWorkspaceMemberIsNotInParticipants =
      messageThreadIds.reduce(
        (
          messageThreadIdsForWhichWorkspaceMemberIsInNotParticipantsAcc: string[],
          messageThreadId,
        ) => {
          const threadMessagesWithWorkspaceMemberInParticipants =
            threadParticipantsByThreadId[messageThreadId].filter(
              (threadParticipant) =>
                threadParticipant.workspaceMemberId === workspaceMemberId,
            );

          if (threadMessagesWithWorkspaceMemberInParticipants.length === 0)
            messageThreadIdsForWhichWorkspaceMemberIsInNotParticipantsAcc.push(
              messageThreadId,
            );

          return messageThreadIdsForWhichWorkspaceMemberIsInNotParticipantsAcc;
        },
        [],
      );

    const messageThreadRepository =
      await this.twentyORMManager.getRepository<MessageThreadWorkspaceEntity>(
        'messageThread',
      );

    const threadVisibility = await messageThreadRepository
      .createQueryBuilder('messageThread')
      .select(['messageThread.id', 'messageChannel.visibility'])
      .leftJoin('messageThread.messages', 'message')
      .leftJoin(
        'message.messageChannelMessageAssociations',
        'messageChannelMessageAssociation',
      )
      .leftJoin(
        'messageChannelMessageAssociation.messageChannel',
        'messageChannel',
      )
      .where('messageThread.id = ANY(:messageThreadIds)', {
        messageThreadIds:
          messageThreadIdsForWhichWorkspaceMemberIsNotInParticipants,
      })
      .getRawMany();

    const visibilityValues = Object.values(MessageChannelVisibility);

    const threadVisibilityByThreadIdForWhichWorkspaceMemberIsNotInParticipants:
      | {
          [key: string]: MessageChannelVisibility;
        }
      | undefined = threadVisibility?.reduce(
      (threadVisibilityAcc, threadVisibility) => {
        threadVisibilityAcc[threadVisibility.id] =
          visibilityValues[
            Math.max(
              visibilityValues.indexOf(threadVisibility.visibility),
              visibilityValues.indexOf(
                threadVisibilityAcc[threadVisibility.id] ??
                  MessageChannelVisibility.METADATA,
              ),
            )
          ];

        return threadVisibilityAcc;
      },
      {},
    );

    const threadVisibilityByThreadId: {
      [key: string]: MessageChannelVisibility;
    } = messageThreadIds.reduce((threadVisibilityAcc, messageThreadId) => {
      // If the workspace member is not in the participants of the thread, use the visibility value from the query
      threadVisibilityAcc[messageThreadId] =
        messageThreadIdsForWhichWorkspaceMemberIsNotInParticipants.includes(
          messageThreadId,
        )
          ? threadVisibilityByThreadIdForWhichWorkspaceMemberIsNotInParticipants?.[
              messageThreadId
            ] ?? MessageChannelVisibility.METADATA
          : MessageChannelVisibility.SHARE_EVERYTHING;

      return threadVisibilityAcc;
    }, {});

    return threadVisibilityByThreadId;
  }
}
