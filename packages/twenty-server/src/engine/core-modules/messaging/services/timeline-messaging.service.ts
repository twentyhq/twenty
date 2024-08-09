import { Injectable } from '@nestjs/common';

import { Any } from 'typeorm';

import { TimelineThread } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MessageChannelVisibility } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';

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
      select: {
        id: true,
        messages: {
          receivedAt: true,
          subject: true,
          text: true,
        },
      },
      where: {
        messages: {
          messageParticipants: {
            personId: Any(personIds),
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

    return messageThreads.map((messageThread) => {
      const lastMessage = messageThread.messages[0];
      const firstMessage =
        messageThread.messages[messageThread.messages.length - 1];

      return {
        id: messageThread.id,
        subject: firstMessage.subject,
        lastMessageBody: lastMessage.text,
        lastMessageReceivedAt: lastMessage.receivedAt ?? new Date(),
        numberOfMessagesInThread: messageThread.messages.length,
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
      .createQueryBuilder()
      .select('messageThread.id', 'id')
      .addSelect('messageChannel.visibility', 'visibility')
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
