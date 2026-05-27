import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  MessageChannelVisibility,
  MessageParticipantRole,
} from 'twenty-shared/types';
import { In, type Repository } from 'typeorm';

import { type TimelineThreadDTO } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class TimelineMessagingService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  public async getAndCountMessageThreads(
    personIds: string[],
    workspaceId: string,
    offset: number,
    pageSize: number,
  ): Promise<{
    messageThreads: Omit<
      TimelineThreadDTO,
      | 'firstParticipant'
      | 'lastTwoParticipants'
      | 'participantCount'
      | 'read'
      | 'visibility'
    >[];
    totalNumberOfThreads: number;
  }> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const messageThreadRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageThreadWorkspaceEntity>(
            workspaceId,
            'messageThread',
          );

        const totalNumberOfThreads = await messageThreadRepository
          .createQueryBuilder('messageThread')
          .innerJoin('messageThread.messages', 'messages')
          .innerJoin('messages.messageParticipants', 'messageParticipants')
          .where('messageParticipants.personId IN(:...personIds)', {
            personIds,
          })
          .groupBy('messageThread.id')
          .getCount();

        const threadIdsQuery = await messageThreadRepository
          .createQueryBuilder('messageThread')
          .select('messageThread.id', 'id')
          .addSelect('MAX(messages.receivedAt)', 'max_received_at')
          .innerJoin('messageThread.messages', 'messages')
          .innerJoin('messages.messageParticipants', 'messageParticipants')
          .where('messageParticipants.personId IN (:...personIds)', {
            personIds,
          })
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
              subject: firstMessage.subject ?? '',
              lastMessageBody: lastMessage.text ?? '',
              lastMessageReceivedAt: lastMessage.receivedAt ?? new Date(),
              numberOfMessagesInThread: messageThread.messages.length,
            };
          }),
          totalNumberOfThreads,
        };
      },
      authContext,
    );
  }

  public async getThreadParticipantsByThreadId(
    messageThreadIds: string[],
    workspaceId: string,
  ): Promise<{
    [key: string]: MessageParticipantWorkspaceEntity[];
  }> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const messageParticipantRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageParticipantWorkspaceEntity>(
            workspaceId,
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
          .andWhere('messageParticipant.role = :role', {
            role: MessageParticipantRole.FROM,
          })
          .orderBy('message.messageThreadId')
          .distinctOn(['message.messageThreadId', 'messageParticipant.handle'])
          .getMany();

        const orderedThreadParticipants = threadParticipants.sort(
          (a, b) =>
            (a.message.receivedAt ?? new Date()).getTime() -
            (b.message.receivedAt ?? new Date()).getTime(),
        );

        const threadParticipantsWithCompositeFields =
          orderedThreadParticipants.map((threadParticipant) => ({
            ...threadParticipant,
            person: {
              id: threadParticipant.person?.id,
              name: {
                //oxlint-disable-next-line
                //@ts-ignore
                firstName: threadParticipant.person?.nameFirstName,
                //oxlint-disable-next-line
                //@ts-ignore
                lastName: threadParticipant.person?.nameLastName,
              },
              avatarUrl: threadParticipant.person?.avatarUrl,
            },
            workspaceMember: {
              id: threadParticipant.workspaceMember?.id,
              name: {
                //oxlint-disable-next-line
                //@ts-ignore
                firstName: threadParticipant.workspaceMember?.nameFirstName,
                //oxlint-disable-next-line
                //@ts-ignore
                lastName: threadParticipant.workspaceMember?.nameLastName,
              },
              avatarUrl: threadParticipant.workspaceMember?.avatarUrl,
            },
          }));

        return threadParticipantsWithCompositeFields.reduce(
          (threadParticipantsAcc, threadParticipant) => {
            if (!threadParticipant.message.messageThreadId)
              return threadParticipantsAcc;

            if (
              // @ts-expect-error legacy noImplicitAny
              !threadParticipantsAcc[threadParticipant.message.messageThreadId]
            )
              // @ts-expect-error legacy noImplicitAny
              threadParticipantsAcc[threadParticipant.message.messageThreadId] =
                [];

            // @ts-expect-error legacy noImplicitAny
            threadParticipantsAcc[
              threadParticipant.message.messageThreadId
            ].push(threadParticipant);

            return threadParticipantsAcc;
          },
          {},
        );
      },
      authContext,
    );
  }

  public async getThreadVisibilityByThreadId(
    messageThreadIds: string[],
    workspaceMemberId: string,
    workspaceId: string,
  ): Promise<{
    [key: string]: MessageChannelVisibility;
  }> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            workspaceId,
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        const currentMember = await workspaceMemberRepository.findOne({
          where: { id: workspaceMemberId },
          select: { userId: true },
        });

        if (!currentMember) {
          return {};
        }

        const currentUserWorkspace = await this.userWorkspaceRepository.findOne(
          {
            where: { userId: currentMember.userId, workspaceId },
            select: { id: true },
          },
        );

        if (!currentUserWorkspace) {
          return {};
        }

        const currentUserWorkspaceId = currentUserWorkspace.id;

        const messageThreadRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageThreadWorkspaceEntity>(
            workspaceId,
            'messageThread',
          );

        const threadChannelRows = await messageThreadRepository
          .createQueryBuilder()
          .select('messageThread.id', 'id')
          .addSelect(
            'messageChannelMessageAssociation.messageChannelId',
            'messageChannelId',
          )
          .leftJoin('messageThread.messages', 'message')
          .leftJoin(
            'message.messageChannelMessageAssociations',
            'messageChannelMessageAssociation',
          )
          .where('messageThread.id = ANY(:messageThreadIds)', {
            messageThreadIds,
          })
          .getRawMany<{ id: string; messageChannelId: string | null }>();

        const allMessageChannelIds = [
          ...new Set(
            threadChannelRows
              .map((row) => row.messageChannelId)
              .filter((id): id is string => id !== null && id !== undefined),
          ),
        ];

        if (allMessageChannelIds.length === 0) {
          return {};
        }

        const messageChannels = await this.messageChannelRepository.find({
          where: { id: In(allMessageChannelIds), workspaceId },
          select: { id: true, visibility: true, connectedAccountId: true },
        });

        const allConnectedAccountIds = [
          ...new Set(
            messageChannels.map((channel) => channel.connectedAccountId),
          ),
        ];

        const ownedAccountIds = new Set(
          (
            await this.connectedAccountRepository.find({
              where: {
                id: In(allConnectedAccountIds),
                userWorkspaceId: currentUserWorkspaceId,
              },
              select: { id: true },
            })
          ).map((account) => account.id),
        );

        const channelVisibilityMap = new Map(
          messageChannels.map((channel) => [
            channel.id,
            ownedAccountIds.has(channel.connectedAccountId)
              ? MessageChannelVisibility.SHARE_EVERYTHING
              : channel.visibility,
          ]),
        );

        const visibilityValues = Object.values(MessageChannelVisibility);

        const threadVisibilityByThreadId: {
          [key: string]: MessageChannelVisibility;
        } = {};

        for (const { id: threadId, messageChannelId } of threadChannelRows) {
          if (!messageChannelId) continue;

          const channelVisibility = channelVisibilityMap.get(messageChannelId);

          if (!channelVisibility) continue;

          threadVisibilityByThreadId[threadId] =
            visibilityValues[
              Math.max(
                visibilityValues.indexOf(channelVisibility),
                visibilityValues.indexOf(
                  threadVisibilityByThreadId[threadId] ??
                    MessageChannelVisibility.METADATA,
                ),
              )
            ];
        }

        return threadVisibilityByThreadId;
      },
      authContext,
    );
  }
}
