import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  MessageChannelVisibility,
  MessageParticipantRole,
} from 'twenty-shared/types';
import { isNonEmptyString } from '@sniptt/guards';
import { escapeForIlike, isDefined } from 'twenty-shared/utils';
import { In, type Repository } from 'typeorm';

import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { TIMELINE_THREADS_DEFAULT_PAGE_SIZE } from 'src/engine/core-modules/messaging/constants/messaging.constants';
import { type TimelineThreadDTO } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';
import { getEffectiveMessageChannelVisibility } from 'src/engine/core-modules/messaging/utils/get-effective-message-channel-visibility.util';
import { type TargetFilter } from 'src/engine/core-modules/target/utils/get-target-field-name-for-object-record.util';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';

type TimelineMessageThread = Omit<
  TimelineThreadDTO,
  | 'firstParticipant'
  | 'lastTwoParticipants'
  | 'participantCount'
  | 'read'
  | 'visibility'
>;

@Injectable()
export class TimelineMessagingService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly fileUrlService: FileUrlService,
  ) {}

  public async getAndCountMessageThreads(
    personIds: string[],
    workspaceId: string,
    offset: number,
    pageSize: number,
    targetFilter?: TargetFilter,
  ): Promise<{
    messageThreads: TimelineMessageThread[];
    totalNumberOfThreads: number;
  }> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageThreadRepository =
        this.workspaceOrmManager.getRepository<MessageThreadWorkspaceEntity>(
          'messageThread',
          { shouldBypassPermissionChecks: true },
        );

      const totalQueryBuilder = messageThreadRepository
        .createQueryBuilder('messageThread')
        .innerJoin('messageThread.messages', 'messages')
        .groupBy('messageThread.id');
      const threadIdsQueryBuilder = messageThreadRepository
        .createQueryBuilder('messageThread')
        .select('messageThread.id', 'id')
        .addSelect('MAX(messages.receivedAt)', 'max_received_at')
        .innerJoin('messageThread.messages', 'messages')
        .groupBy('messageThread.id')
        .orderBy('max_received_at', 'DESC')
        .offset(offset)
        .limit(pageSize);

      this.applyRecordFilter(totalQueryBuilder, { targetFilter, personIds });
      this.applyRecordFilter(threadIdsQueryBuilder, {
        targetFilter,
        personIds,
      });

      const totalNumberOfThreads = await totalQueryBuilder.getCount();
      const threadIdsQuery = await threadIdsQueryBuilder.getRawMany<{
        id: string;
      }>();

      const messageThreadIds = threadIdsQuery.map((thread) => thread.id);

      return {
        messageThreads: await this.findMessageThreadsByIds(messageThreadIds),
        totalNumberOfThreads,
      };
    }, authContext);
  }

  public async searchMessageThreads({
    workspaceId,
    searchInput,
    messageChannelIds,
    recordFilter,
    excludedMessageThreadIds = [],
  }: {
    workspaceId: string;
    searchInput: string;
    messageChannelIds: string[];
    recordFilter?: { targetFilter?: TargetFilter; personIds: string[] };
    excludedMessageThreadIds?: string[];
  }): Promise<TimelineMessageThread[]> {
    const searchWords = searchInput
      .trim()
      .split(/\s+/)
      .filter(isNonEmptyString);

    if (searchWords.length === 0 || messageChannelIds.length === 0) {
      return [];
    }

    if (
      isDefined(recordFilter) &&
      !isDefined(recordFilter.targetFilter) &&
      recordFilter.personIds.length === 0
    ) {
      return [];
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageThreadRepository =
        this.workspaceOrmManager.getRepository<MessageThreadWorkspaceEntity>(
          'messageThread',
          { shouldBypassPermissionChecks: true },
        );

      const queryBuilder = messageThreadRepository
        .createQueryBuilder('messageThread')
        .select('messageThread.id', 'id')
        .addSelect('MAX(messages.receivedAt)', 'max_received_at')
        .innerJoin('messageThread.messages', 'messages')
        .innerJoin(
          'messages.messageChannelMessageAssociations',
          'messageChannelMessageAssociations',
        )
        .where(
          'messageChannelMessageAssociations.messageChannelId IN (:...messageChannelIds)',
          { messageChannelIds },
        );

      searchWords.forEach((searchWord, index) => {
        const parameterName = `searchWord${index}`;

        queryBuilder.andWhere(`messages.subject ILIKE :${parameterName}`, {
          [parameterName]: `%${escapeForIlike(searchWord)}%`,
        });
      });

      if (isDefined(recordFilter)) {
        this.applyRecordFilter(queryBuilder, recordFilter);
      }

      if (excludedMessageThreadIds.length > 0) {
        queryBuilder.andWhere(
          'messageThread.id NOT IN (:...excludedMessageThreadIds)',
          { excludedMessageThreadIds },
        );
      }

      const threadIdsQuery = await queryBuilder
        .groupBy('messageThread.id')
        .orderBy('max_received_at', 'DESC')
        .limit(TIMELINE_THREADS_DEFAULT_PAGE_SIZE)
        .getRawMany<{ id: string }>();

      return this.findMessageThreadsByIds(
        threadIdsQuery.map((thread) => thread.id),
      );
    }, buildSystemAuthContext(workspaceId));
  }

  public async getSearchableMessageChannelIds({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<{
    ownedMessageChannelIds: string[];
    subjectVisibleMessageChannelIds: string[];
  }> {
    const [ownedConnectedAccounts, messageChannels] = await Promise.all([
      this.connectedAccountRepository.find({
        where: { userWorkspaceId, workspaceId },
        select: { id: true },
      }),
      this.messageChannelRepository.find({
        where: { workspaceId },
        select: { id: true, visibility: true, connectedAccountId: true },
      }),
    ]);

    const ownedConnectedAccountIds = new Set(
      ownedConnectedAccounts.map((connectedAccount) => connectedAccount.id),
    );

    const ownedMessageChannelIds: string[] = [];
    const subjectVisibleMessageChannelIds: string[] = [];

    for (const messageChannel of messageChannels) {
      const isOwnedByCurrentUser = ownedConnectedAccountIds.has(
        messageChannel.connectedAccountId,
      );
      const visibility = getEffectiveMessageChannelVisibility({
        visibility: messageChannel.visibility,
        isOwnedByCurrentUser,
      });

      if (isOwnedByCurrentUser) {
        ownedMessageChannelIds.push(messageChannel.id);
      }

      if (
        visibility === MessageChannelVisibility.SUBJECT ||
        visibility === MessageChannelVisibility.SHARE_EVERYTHING
      ) {
        subjectVisibleMessageChannelIds.push(messageChannel.id);
      }
    }

    return { ownedMessageChannelIds, subjectVisibleMessageChannelIds };
  }

  private applyRecordFilter(
    queryBuilder: WorkspaceSelectQueryBuilder,
    {
      targetFilter,
      personIds,
    }: { targetFilter?: TargetFilter; personIds: string[] },
  ): void {
    if (isDefined(targetFilter)) {
      queryBuilder
        .innerJoin('messageThread.messageThreadTargets', 'messageThreadTargets')
        .andWhere(
          `messageThreadTargets.${targetFilter.fieldName} = :targetRecordId`,
          { targetRecordId: targetFilter.recordId },
        );

      return;
    }

    queryBuilder
      .innerJoin('messages.messageParticipants', 'messageParticipants')
      .andWhere('messageParticipants.personId IN (:...personIds)', {
        personIds,
      });
  }

  private async findMessageThreadsByIds(
    messageThreadIds: string[],
  ): Promise<TimelineMessageThread[]> {
    if (messageThreadIds.length === 0) {
      return [];
    }

    const messageThreadRepository =
      this.workspaceOrmManager.getRepository<MessageThreadWorkspaceEntity>(
        'messageThread',
        { shouldBypassPermissionChecks: true },
      );

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

    const messageThreadPositionById = new Map(
      messageThreadIds.map((messageThreadId, index) => [
        messageThreadId,
        index,
      ]),
    );

    return messageThreads
      .sort(
        (a, b) =>
          (messageThreadPositionById.get(a.id) ?? 0) -
          (messageThreadPositionById.get(b.id) ?? 0),
      )
      .map((messageThread) => {
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
      });
  }

  public async getThreadParticipantsByThreadId(
    messageThreadIds: string[],
    workspaceId: string,
  ): Promise<{
    [key: string]: MessageParticipantWorkspaceEntity[];
  }> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageParticipantRepository =
        this.workspaceOrmManager.getRepository<MessageParticipantWorkspaceEntity>(
          'messageParticipant',
          { shouldBypassPermissionChecks: true },
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
        .getMany<MessageParticipantWorkspaceEntity>();

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
          threadParticipantsAcc[threadParticipant.message.messageThreadId].push(
            threadParticipant,
          );

          return threadParticipantsAcc;
        },
        {},
      );
    }, authContext);
  }

  public async getThreadVisibilityByThreadId({
    messageThreadIds,
    userWorkspaceId,
    workspaceId,
  }: {
    messageThreadIds: string[];
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<{
    [key: string]: MessageChannelVisibility;
  }> {
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageThreadRepository =
        this.workspaceOrmManager.getRepository<MessageThreadWorkspaceEntity>(
          'messageThread',
          { shouldBypassPermissionChecks: true },
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
              userWorkspaceId,
            },
            select: { id: true },
          })
        ).map((account) => account.id),
      );

      const channelVisibilityMap = new Map(
        messageChannels.map((channel) => [
          channel.id,
          getEffectiveMessageChannelVisibility({
            visibility: channel.visibility,
            isOwnedByCurrentUser: ownedAccountIds.has(
              channel.connectedAccountId,
            ),
          }),
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
    }, buildSystemAuthContext(workspaceId));
  }
}
