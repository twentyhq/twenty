import { Injectable } from '@nestjs/common';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MessageChannelVisibility } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';

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
  ): Promise<MessageThreadWorkspaceEntity[]> {
    const messageThreadRepository =
      await this.twentyORMManager.getRepository<MessageThreadWorkspaceEntity>(
        'messageThread',
      );

    return messageThreadRepository
      .createQueryBuilder('messageThread')
      .select([
        'messageThread.id',
        'messageThread.lastMessageReceivedAt',
        'messageThread.lastMessageId',
        'messageThread.lastMessageBody',
        '(SELECT COUNT(*) FROM message m WHERE m.messageThreadId = messageThread.id) AS messageCount',
        '(SELECT message.subject FROM message WHERE message.messageThreadId = messageThread.id ORDER BY message.receivedAt ASC LIMIT 1) AS subject',
      ])
      .addSelect(
        'ROW_NUMBER() OVER (PARTITION BY messageThread.id ORDER BY MAX(message."receivedAt") DESC)',
        'rowNumber',
      )
      .leftJoin('messageThread.messages', 'message')
      .leftJoin('message.participants', 'messageParticipant')
      .where('messageParticipant.personId IN (:...personIds)', { personIds })
      .andWhere(
        'EXISTS (SELECT 1 FROM messageChannelMessageAssociation mcma WHERE mcma.messageId = message.id)',
      )
      .groupBy('messageThread.id')
      .addGroupBy('message.id')
      .orderBy('message.receivedAt', 'DESC')
      .limit(pageSize)
      .offset(offset)
      .getRawMany();
  }

  public async getThreadVisibilityByThreadId(
    messageThreadIds: string[],
    threadParticipants: MessageParticipantWorkspaceEntity[],
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
            threadParticipants?.filter(
              (threadMessage) =>
                threadMessage.id === messageThreadId &&
                threadMessage.workspaceMemberId === workspaceMemberId,
            ) ?? [];

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
      .leftJoin('message.channels', 'messageChannel')
      .where('messageThread.id IN (:...messageThreadIds)', {
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
