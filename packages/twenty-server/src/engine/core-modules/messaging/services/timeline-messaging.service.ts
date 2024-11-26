import { Injectable } from '@nestjs/common';

import { Any, Not } from 'typeorm';

import { TimelineThread } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MessageChannelVisibility } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';

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

    const [messageThreadIds, totalNumberOfThreads] =
      await messageThreadRepository.findAndCount({
        select: {
          id: true,
        },
        where: {
          messages: {
            messageParticipants: {
              personId: Any(personIds),
            },
          },
        },
        order: {
          messages: {
            receivedAt: 'DESC',
          },
        },
        skip: offset,
        take: pageSize,
        relations: ['messages'],
      });

    const messageThreads = await messageThreadRepository.find({
      select: {
        id: true,
      },
      where: {
        id: Any(messageThreadIds.map((thread) => thread.id)),
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

        if (!threadParticipantsAcc[threadParticipant.message.messageThreadId])
          threadParticipantsAcc[threadParticipant.message.messageThreadId] = [];

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

    const threadsWithoutWorkspaceMember = await messageThreadRepository.find({
      select: {
        id: true,
      },
      where: {
        id: Any(messageThreadIds),
        messages: {
          messageChannelMessageAssociations: {
            messageChannel: {
              connectedAccount: {
                accountOwnerId: Not(workspaceMemberId),
              },
            },
          },
        },
      },
    });

    const threadIdsWithoutWorkspaceMember = threadsWithoutWorkspaceMember.map(
      (thread) => thread.id,
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
        messageThreadIds: threadIdsWithoutWorkspaceMember,
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
        threadIdsWithoutWorkspaceMember.includes(messageThreadId)
          ? (threadVisibilityByThreadIdForWhichWorkspaceMemberIsNotInParticipants?.[
              messageThreadId
            ] ?? MessageChannelVisibility.METADATA)
          : MessageChannelVisibility.SHARE_EVERYTHING;

      return threadVisibilityAcc;
    }, {});

    return threadVisibilityByThreadId;
  }
}
