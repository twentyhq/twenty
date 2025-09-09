import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

import { type TimelineThread } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MessageChannelVisibility } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';

@Injectable()
export class TimelineMessagingService {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  public async getAndCountMessageThreads(
    personIds: string[],
    offset: number,
    pageSize: number,
  ): Promise<{
    messageThreads: Omit<
      TimelineThread,
      | 'firstParticipant'
      | 'lastTwoParticipants'
      | 'participantCount'
      | 'read'
      | 'visibility'
    >[];
    totalNumberOfThreads: number;
  }> {
    const messageThreadRepository =
      await this.twentyORMManager.getRepository<MessageThreadWorkspaceEntity>(
        'messageThread',
      );

    const totalNumberOfThreads = await messageThreadRepository
      .createQueryBuilder('messageThread')
      .innerJoin('messageThread.messages', 'messages')
      .innerJoin('messages.messageParticipants', 'messageParticipants')
      .where('messageParticipants.personId IN(:...personIds)', { personIds })
      .groupBy('messageThread.id')
      .getCount();

    const threadIdsQuery = await messageThreadRepository
      .createQueryBuilder('messageThread')
      .select('messageThread.id', 'id')
      .addSelect('MAX(messages.receivedAt)', 'max_received_at')
      .innerJoin('messageThread.messages', 'messages')
      .innerJoin('messages.messageParticipants', 'messageParticipants')
      .where('messageParticipants.personId IN (:...personIds)', { personIds })
      .groupBy('messageThread.id')
      .orderBy('max_received_at', 'DESC')
      .offset(offset)
      .limit(pageSize)
      .getRawMany();

    const messageThreadIds = threadIdsQuery.map((thread) => thread.id);

    const messageThreads = await messageThreadRepository.find({
      where: {
        id: In(messageThreadIds),
      },
      order: {
        messages: {
          receivedAt: 'DESC',
        },
      },
      relations: ['messages'],
    });

    return {
      messageThreads: messageThreads.map((messageThread) => {
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
      }),
      totalNumberOfThreads,
    };
  }

  public async getThreadParticipantsByThreadId(
    messageThreadIds: string[],
  ): Promise<{
    [key: string]: MessageParticipantWorkspaceEntity[];
  }> {
    const messageParticipantRepository =
      await this.twentyORMManager.getRepository<MessageParticipantWorkspaceEntity>(
        'messageParticipant',
      );

    const threadParticipants = await messageParticipantRepository
      .createQueryBuilder()
      .select('messageParticipant')
      .addSelect('message.messageThreadId')
      .addSelect('message.receivedAt')
      .leftJoinAndSelect('messageParticipant.person', 'person')
      .leftJoinAndSelect(
        'messageParticipant.workspaceMember',
        'workspaceMember',
      )
      .leftJoin('messageParticipant.message', 'message')
      .where('message.messageThreadId = ANY(:messageThreadIds)', {
        messageThreadIds,
      })
      .andWhere('messageParticipant.role = :role', { role: 'from' })
      .orderBy('message.messageThreadId')
      .distinctOn(['message.messageThreadId', 'messageParticipant.handle'])
      .getMany();

    // This is because subqueries are not handled by twentyORM
    const orderedThreadParticipants = threadParticipants.sort(
      (a, b) =>
        (a.message.receivedAt ?? new Date()).getTime() -
        (b.message.receivedAt ?? new Date()).getTime(),
    );

    // This is because composite fields are not handled correctly by the ORM
    const threadParticipantsWithCompositeFields = orderedThreadParticipants.map(
      (threadParticipant) => ({
        ...threadParticipant,
        person: {
          id: threadParticipant.person?.id,
          name: {
            //eslint-disable-next-line
            //@ts-ignore
            firstName: threadParticipant.person?.nameFirstName,
            //eslint-disable-next-line
            //@ts-ignore
            lastName: threadParticipant.person?.nameLastName,
          },
          avatarUrl: threadParticipant.person?.avatarUrl,
        },
        workspaceMember: {
          id: threadParticipant.workspaceMember?.id,
          name: {
            //eslint-disable-next-line
            //@ts-ignore
            firstName: threadParticipant.workspaceMember?.nameFirstName,
            //eslint-disable-next-line
            //@ts-ignore
            lastName: threadParticipant.workspaceMember?.nameLastName,
          },
          avatarUrl: threadParticipant.workspaceMember?.avatarUrl,
        },
      }),
    );

    return threadParticipantsWithCompositeFields.reduce(
      (threadParticipantsAcc, threadParticipant) => {
        if (!threadParticipant.message.messageThreadId)
          return threadParticipantsAcc;

        // @ts-expect-error legacy noImplicitAny
        if (!threadParticipantsAcc[threadParticipant.message.messageThreadId])
          // @ts-expect-error legacy noImplicitAny
          threadParticipantsAcc[threadParticipant.message.messageThreadId] = [];

        // @ts-expect-error legacy noImplicitAny
        threadParticipantsAcc[threadParticipant.message.messageThreadId].push(
          threadParticipant,
        );

        return threadParticipantsAcc;
      },
      {},
    );
  }

  public async getThreadVisibilityByThreadId(
    messageThreadIds: string[],
    workspaceMemberId: string,
  ): Promise<{
    [key: string]: MessageChannelVisibility;
  }> {
    const messageThreadRepository =
      await this.twentyORMManager.getRepository<MessageThreadWorkspaceEntity>(
        'messageThread',
      );

    const threadVisibility = await messageThreadRepository
      .createQueryBuilder()
      .select('messageThread.id', 'id')
      .addSelect('messageChannel.visibility', 'visibility')
      .addSelect('connectedAccount.accountOwnerId', 'accountOwnerId')
      .leftJoin('messageThread.messages', 'message')
      .leftJoin(
        'message.messageChannelMessageAssociations',
        'messageChannelMessageAssociation',
      )
      .leftJoin(
        'messageChannelMessageAssociation.messageChannel',
        'messageChannel',
      )
      .leftJoin('messageChannel.connectedAccount', 'connectedAccount')
      .where('messageThread.id = ANY(:messageThreadIds)', {
        messageThreadIds: messageThreadIds,
      })
      .getRawMany();

    const visibilityValues = Object.values(MessageChannelVisibility);

    const threadVisibilityByThreadId: {
      [key: string]: MessageChannelVisibility;
    } = threadVisibility.reduce((threadVisibilityAcc, threadVisibility) => {
      if (threadVisibility.accountOwnerId === workspaceMemberId) {
        threadVisibilityAcc[threadVisibility.id] =
          MessageChannelVisibility.SHARE_EVERYTHING;

        return threadVisibilityAcc;
      }

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
    }, {});

    return threadVisibilityByThreadId;
  }
}
