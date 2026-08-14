import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  MessageChannelVisibility,
  MessageParticipantRole,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, type Repository } from 'typeorm';

import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { type TimelineThreadDTO } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
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
    private readonly fileUrlService: FileUrlService,
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
        const messageParticipantRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageParticipantWorkspaceEntity>(
            workspaceId,
            'messageParticipant',
          );
        const messageRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageWorkspaceEntity>(
            workspaceId,
            'message',
          );

        // ORM v2 does not join to-many relations, so the thread set is resolved
        // with flat queries: participants of these people -> their messages ->
        // threads, tracking the latest message date per thread for ordering.
        const participants = await messageParticipantRepository.find({
          where: { personId: In(personIds) },
          select: { messageId: true },
        });

        const participantMessageIds = [
          ...new Set(participants.map((participant) => participant.messageId)),
        ];

        const participantMessages = isNonEmptyArray(participantMessageIds)
          ? await messageRepository.find({
              where: { id: In(participantMessageIds) },
              select: { messageThreadId: true, receivedAt: true },
            })
          : [];

        const latestReceivedAtByThreadId = new Map<string, number>();

        for (const message of participantMessages) {
          if (!isDefined(message.messageThreadId)) {
            continue;
          }

          const receivedAtTime = (message.receivedAt ?? new Date(0)).getTime();
          const currentLatest = latestReceivedAtByThreadId.get(
            message.messageThreadId,
          );

          if (!isDefined(currentLatest) || receivedAtTime > currentLatest) {
            latestReceivedAtByThreadId.set(
              message.messageThreadId,
              receivedAtTime,
            );
          }
        }

        const totalNumberOfThreads = latestReceivedAtByThreadId.size;

        const messageThreadIds = [...latestReceivedAtByThreadId.entries()]
          .sort(([, aReceivedAt], [, bReceivedAt]) => bReceivedAt - aReceivedAt)
          .slice(offset, offset + pageSize)
          .map(([threadId]) => threadId);

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
              lastMessageIsDraft: lastMessage.isDraft ?? false,
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
        const messageRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageWorkspaceEntity>(
            workspaceId,
            'message',
          );

        const threadMessages = await messageRepository.find({
          where: { messageThreadId: In(messageThreadIds) },
          select: { id: true, messageThreadId: true, receivedAt: true },
        });

        const messageById = new Map(
          threadMessages.map((message) => [message.id, message]),
        );

        const threadMessageIds = threadMessages.map((message) => message.id);

        const fromParticipants = isNonEmptyArray(threadMessageIds)
          ? await messageParticipantRepository.find({
              where: {
                messageId: In(threadMessageIds),
                role: MessageParticipantRole.FROM,
              },
              relations: ['person', 'workspaceMember'],
            })
          : [];

        // ORM v2 has no DISTINCT ON, so keep one FROM participant per
        // (thread, handle) in memory, attaching its message for downstream use.
        const seenThreadHandleKeys = new Set<string>();
        const threadParticipants: MessageParticipantWorkspaceEntity[] = [];

        for (const participant of fromParticipants) {
          const message = messageById.get(participant.messageId);

          if (!isDefined(message) || !isDefined(message.messageThreadId)) {
            continue;
          }

          const threadHandleKey = `${message.messageThreadId}:${participant.handle}`;

          if (seenThreadHandleKeys.has(threadHandleKey)) {
            continue;
          }

          seenThreadHandleKeys.add(threadHandleKey);
          threadParticipants.push({ ...participant, message });
        }

        const orderedThreadParticipants = threadParticipants.sort(
          (a, b) =>
            (a.message.receivedAt ?? new Date()).getTime() -
            (b.message.receivedAt ?? new Date()).getTime(),
        );

        const threadParticipantPromises = orderedThreadParticipants.map(
          async (threadParticipant) => {
            const personAvatarFileUrl =
              await this.fileUrlService.signFirstFilesFieldFileUrl({
                filesFieldValue: threadParticipant.person?.avatarFile,
                workspaceId,
              });

            return {
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
                avatarUrl:
                  personAvatarFileUrl || threadParticipant.person?.avatarUrl,
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
            };
          },
        );

        const threadParticipantsWithCompositeFields = await Promise.all(
          threadParticipantPromises,
        );

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

        const messageRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageWorkspaceEntity>(
            workspaceId,
            'message',
          );
        const messageChannelMessageAssociationRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
            workspaceId,
            'messageChannelMessageAssociation',
          );

        // ORM v2 does not join to-many relations: resolve thread -> messages ->
        // channel associations with flat queries and stitch them in memory.
        const threadMessages = await messageRepository.find({
          where: { messageThreadId: In(messageThreadIds) },
          select: { id: true, messageThreadId: true },
        });

        const threadIdByMessageId = new Map(
          threadMessages.map((message) => [message.id, message.messageThreadId]),
        );

        const threadMessageIds = threadMessages.map((message) => message.id);

        const messageChannelAssociations = isNonEmptyArray(threadMessageIds)
          ? await messageChannelMessageAssociationRepository.find({
              where: { messageId: In(threadMessageIds) },
              select: { messageId: true, messageChannelId: true },
            })
          : [];

        const threadChannelRows = messageChannelAssociations
          .map((association) => ({
            id: threadIdByMessageId.get(association.messageId) ?? null,
            messageChannelId: association.messageChannelId,
          }))
          .filter(
            (row): row is { id: string; messageChannelId: string } =>
              isDefined(row.id),
          );

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
