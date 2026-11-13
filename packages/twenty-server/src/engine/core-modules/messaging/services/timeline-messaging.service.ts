import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chunk from 'lodash.chunk';
import { type MessagingProviderConversationStyle } from 'twenty-shared/application';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import {
  MessageChannelVisibility,
  MessageParticipantRole,
} from 'twenty-shared/types';
import { isNonEmptyString } from '@sniptt/guards';
import { escapeForIlike, isDefined } from 'twenty-shared/utils';
import { In, IsNull, type Repository } from 'typeorm';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { TIMELINE_THREADS_DEFAULT_PAGE_SIZE } from 'src/engine/core-modules/messaging/constants/messaging.constants';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type TimelineThreadChannelFilterInput } from 'src/engine/core-modules/messaging/dtos/timeline-thread-channel-filter.input';
import { type TimelineThreadChannelDTO } from 'src/engine/core-modules/messaging/dtos/timeline-thread-channel.dto';
import { type TimelineThreadDTO } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';
import { getEffectiveMessageChannelVisibility } from 'src/engine/core-modules/messaging/utils/get-effective-message-channel-visibility.util';
import { type TargetFilter } from 'src/engine/core-modules/target/utils/get-target-field-name-for-object-record.util';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { isMessageReadStateProvisioned } from 'src/modules/messaging/common/utils/is-message-read-state-provisioned.util';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';

type TimelineMessageThread = Omit<
  TimelineThreadDTO,
  | 'firstParticipant'
  | 'lastTwoParticipants'
  | 'participantCount'
  | 'read'
  | 'visibility'
  | 'channel'
>;

@Injectable()
export class TimelineMessagingService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly fileUrlService: FileUrlService,
    private readonly recordPermissionsReadService: RecordPermissionsReadService,
  ) {}

  public async getAndCountMessageThreads({
    personIds,
    workspaceId,
    offset,
    pageSize,
    targetFilter,
    messageChannelIds,
  }: {
    personIds: string[];
    workspaceId: string;
    offset: number;
    pageSize: number;
    targetFilter?: TargetFilter;
    messageChannelIds?: string[];
  }): Promise<{
    messageThreads: TimelineMessageThread[];
    totalNumberOfThreads: number;
  }> {
    if (isDefined(messageChannelIds) && messageChannelIds.length === 0) {
      return { messageThreads: [], totalNumberOfThreads: 0 };
    }

    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageThreadRepository =
        this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<MessageThreadWorkspaceEntity>(
          'messageThread',
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

      for (const queryBuilder of [totalQueryBuilder, threadIdsQueryBuilder]) {
        this.applyRecordFilter(queryBuilder, { targetFilter, personIds });

        if (isDefined(messageChannelIds)) {
          this.applyMessageChannelFilter(queryBuilder, {
            workspaceId,
            messageChannelIds,
          });
        }
      }

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
        this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<MessageThreadWorkspaceEntity>(
          'messageThread',
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

  public async findUnreadMessageThreadIds({
    messageThreadIds,
    userWorkspaceId,
    workspaceId,
  }: {
    messageThreadIds: string[];
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<Set<string>> {
    if (
      messageThreadIds.length === 0 ||
      !(await isMessageReadStateProvisioned({
        workspaceCacheService: this.workspaceCacheService,
        workspaceId,
      }))
    ) {
      return new Set();
    }

    const ownedMessageChannelIds = await this.findOwnedMessageChannelIds({
      userWorkspaceId,
      workspaceId,
    });

    if (ownedMessageChannelIds.length === 0) {
      return new Set();
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const unreadRows = await this.workspaceOrmManager
        .getRepositoryWithoutPermissionChecks<MessageChannelMessageAssociationWorkspaceEntity>(
          'messageChannelMessageAssociation',
        )
        .createQueryBuilder('messageChannelMessageAssociation')
        .select('message.messageThreadId', 'messageThreadId')
        .innerJoin('messageChannelMessageAssociation.message', 'message')
        .where('message.messageThreadId = ANY(:messageThreadIds)', {
          messageThreadIds,
        })
        .andWhere(
          'messageChannelMessageAssociation.messageChannelId = ANY(:ownedMessageChannelIds)',
          { ownedMessageChannelIds },
        )
        .andWhere('messageChannelMessageAssociation.isRead = false')
        .andWhere('messageChannelMessageAssociation.direction = :direction', {
          direction: MessageDirection.INCOMING,
        })
        .groupBy('message.messageThreadId')
        .getRawMany<{ messageThreadId: string }>();

      return new Set(unreadRows.map((row) => row.messageThreadId));
    }, buildSystemAuthContext(workspaceId));
  }

  public async markMessageThreadAsRead({
    messageThreadId,
    userWorkspaceId,
    workspaceId,
  }: {
    messageThreadId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<void> {
    if (
      !(await isMessageReadStateProvisioned({
        workspaceCacheService: this.workspaceCacheService,
        workspaceId,
      }))
    ) {
      return;
    }

    const ownedMessageChannelIds = await this.findOwnedMessageChannelIds({
      userWorkspaceId,
      workspaceId,
    });

    if (ownedMessageChannelIds.length === 0) {
      return;
    }

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageChannelMessageAssociationRepository =
        this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<MessageChannelMessageAssociationWorkspaceEntity>(
          'messageChannelMessageAssociation',
        );

      const unreadAssociations =
        await messageChannelMessageAssociationRepository.find({
          where: {
            messageChannelId: In(ownedMessageChannelIds),
            isRead: false,
            message: { messageThreadId },
          },
          select: { id: true },
        });

      if (unreadAssociations.length === 0) {
        return;
      }

      for (const associationIds of chunk(
        unreadAssociations.map(({ id }) => id),
        QUERY_MAX_RECORDS,
      )) {
        await messageChannelMessageAssociationRepository.update(
          { id: In(associationIds) },
          { isRead: true },
        );
      }
    }, buildSystemAuthContext(workspaceId));
  }

  private async findOwnedMessageChannelIds({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<string[]> {
    const ownedMessageChannels = await this.messageChannelRepository.find({
      where: { workspaceId, connectedAccount: { userWorkspaceId } },
      select: { id: true },
    });

    return ownedMessageChannels.map(({ id }) => id);
  }

  public async findMessageChannelIdsMatchingChannel({
    workspaceId,
    channel,
  }: {
    workspaceId: string;
    channel: TimelineThreadChannelFilterInput;
  }): Promise<string[]> {
    const connectedAccounts = await this.connectedAccountRepository.find({
      where: {
        workspaceId,
        provider: channel.provider,
        applicationId: channel.applicationId ?? IsNull(),
      },
      select: { id: true },
    });

    if (connectedAccounts.length === 0) {
      return [];
    }

    const messageChannels = await this.messageChannelRepository.find({
      where: {
        workspaceId,
        type: channel.type,
        connectedAccountId: In(
          connectedAccounts.map((connectedAccount) => connectedAccount.id),
        ),
      },
      select: { id: true },
    });

    return messageChannels.map((messageChannel) => messageChannel.id);
  }

  public async getRecordThreadChannels({
    workspaceId,
    objectNameSingular,
    recordId,
    personIds,
    targetFilter,
  }: {
    workspaceId: string;
    objectNameSingular: string;
    recordId: string;
    personIds: string[];
    targetFilter?: TargetFilter;
  }): Promise<TimelineThreadChannelDTO[]> {
    const authContext = getWorkspaceAuthContext();

    const recordPermissions =
      await this.recordPermissionsReadService.findRecordsActions({
        authContext,
        objectNameSingular,
        recordIds: [recordId],
      });

    if (!recordPermissions.get(recordId)?.canRead) {
      return [];
    }

    const messageChannelIds =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const messageThreadRepository =
          this.workspaceOrmManager.getRepository<MessageThreadWorkspaceEntity>(
            'messageThread',
          );

        const { permissionsPrincipals, objectIdByNameSingular } =
          getWorkspaceContext();

        if (
          !(await this.recordPermissionsReadService.canAccessSomeRecords({
            operationType: 'read',
            principals: permissionsPrincipals,
            objectMetadataId: objectIdByNameSingular.messageThread,
          }))
        ) {
          return [];
        }

        const queryBuilder = messageThreadRepository
          .createQueryBuilder('messageThread')
          .select(
            'messageChannelMessageAssociations.messageChannelId',
            'messageChannelId',
          )
          .innerJoin('messageThread.messages', 'messages')
          .innerJoin(
            'messages.messageChannelMessageAssociations',
            'messageChannelMessageAssociations',
          );

        this.applyRecordFilter(queryBuilder, { targetFilter, personIds });

        const rows = await queryBuilder
          .groupBy('messageChannelMessageAssociations.messageChannelId')
          .getRawMany<{
            messageChannelId: string;
          }>();

        return rows.map((row) => row.messageChannelId);
      }, authContext);

    if (messageChannelIds.length === 0) {
      return [];
    }

    const channelByMessageChannelId = await this.findChannelByMessageChannelId({
      workspaceId,
      messageChannelIds,
    });

    const channelByKey = new Map<string, TimelineThreadChannelDTO>();

    for (const channel of channelByMessageChannelId.values()) {
      channelByKey.set(
        `${channel.type}:${channel.provider}:${channel.applicationId ?? ''}`,
        channel,
      );
    }

    return [...channelByKey.values()];
  }

  private applyMessageChannelFilter(
    queryBuilder: WorkspaceSelectQueryBuilder,
    {
      workspaceId,
      messageChannelIds,
    }: { workspaceId: string; messageChannelIds: string[] },
  ): void {
    const schemaName = getWorkspaceSchemaName(workspaceId);

    queryBuilder.andWhere(
      `EXISTS (
        SELECT 1
        FROM "${schemaName}"."message" "channelMessage"
        INNER JOIN "${schemaName}"."messageChannelMessageAssociation" "channelMessageAssociation"
          ON "channelMessageAssociation"."messageId" = "channelMessage"."id"
          AND "channelMessageAssociation"."deletedAt" IS NULL
        WHERE "channelMessage"."messageThreadId" = "messageThread"."id"
          AND "channelMessage"."deletedAt" IS NULL
          AND "channelMessageAssociation"."messageChannelId" IN (:...filteredMessageChannelIds)
      )`,
      { filteredMessageChannelIds: messageChannelIds },
    );
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
      this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<MessageThreadWorkspaceEntity>(
        'messageThread',
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
        this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<MessageParticipantWorkspaceEntity>(
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
          if (!threadParticipant.message.messageThreadId) {
            return threadParticipantsAcc;
          }

          if (
            // @ts-expect-error legacy noImplicitAny
            !threadParticipantsAcc[threadParticipant.message.messageThreadId]
          ) {
            // @ts-expect-error legacy noImplicitAny
            threadParticipantsAcc[threadParticipant.message.messageThreadId] =
              [];
          }

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

  public async getMessageThreadChannel({
    messageThreadId,
    userWorkspaceId,
    workspaceId,
  }: {
    messageThreadId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<TimelineThreadChannelDTO | null> {
    const recordsPermissions =
      await this.recordPermissionsReadService.findRecordsActions({
        authContext: getWorkspaceAuthContext(),
        objectNameSingular: 'messageThread',
        recordIds: [messageThreadId],
      });

    if (!recordsPermissions.get(messageThreadId)?.canRead) {
      return null;
    }

    const { threadChannelByThreadId } =
      await this.getThreadVisibilityAndChannelByThreadId({
        messageThreadIds: [messageThreadId],
        userWorkspaceId,
        workspaceId,
      });

    return threadChannelByThreadId[messageThreadId] ?? null;
  }

  private async findConversationStyleByMessagingProviderUniversalIdentifier({
    workspaceId,
    messagingProviderUniversalIdentifiers,
  }: {
    workspaceId: string;
    messagingProviderUniversalIdentifiers: string[];
  }): Promise<Map<string, MessagingProviderConversationStyle | null>> {
    if (messagingProviderUniversalIdentifiers.length === 0) {
      return new Map();
    }

    const { flatMessagingProviderMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatMessagingProviderMaps',
      ]);

    return new Map(
      messagingProviderUniversalIdentifiers.map((universalIdentifier) => [
        universalIdentifier,
        flatMessagingProviderMaps.byUniversalIdentifier[universalIdentifier]
          ?.conversationStyle ?? null,
      ]),
    );
  }

  private async findChannelByMessageChannelId({
    workspaceId,
    messageChannelIds,
  }: {
    workspaceId: string;
    messageChannelIds: string[];
  }): Promise<Map<string, TimelineThreadChannelDTO>> {
    const messageChannels = await this.messageChannelRepository.find({
      where: { id: In(messageChannelIds), workspaceId },
      select: {
        id: true,
        connectedAccountId: true,
        type: true,
        messagingProviderUniversalIdentifier: true,
      },
    });

    const connectedAccounts = await this.connectedAccountRepository.find({
      where: {
        id: In([
          ...new Set(
            messageChannels.map((channel) => channel.connectedAccountId),
          ),
        ]),
        workspaceId,
      },
      select: { id: true, provider: true, applicationId: true },
    });

    return this.buildChannelByMessageChannelId({
      workspaceId,
      messageChannels,
      connectedAccounts,
    });
  }

  private async buildChannelByMessageChannelId({
    workspaceId,
    messageChannels,
    connectedAccounts,
  }: {
    workspaceId: string;
    messageChannels: Pick<
      MessageChannelEntity,
      | 'id'
      | 'type'
      | 'connectedAccountId'
      | 'messagingProviderUniversalIdentifier'
    >[];
    connectedAccounts: Pick<
      ConnectedAccountEntity,
      'id' | 'provider' | 'applicationId'
    >[];
  }): Promise<Map<string, TimelineThreadChannelDTO>> {
    const conversationStyleByMessagingProviderUniversalIdentifier =
      await this.findConversationStyleByMessagingProviderUniversalIdentifier({
        workspaceId,
        messagingProviderUniversalIdentifiers: messageChannels
          .map((channel) => channel.messagingProviderUniversalIdentifier)
          .filter(isDefined),
      });

    const connectedAccountById = new Map(
      connectedAccounts.map((account) => [account.id, account]),
    );

    return new Map<string, TimelineThreadChannelDTO>(
      messageChannels.flatMap((channel) => {
        const connectedAccount = connectedAccountById.get(
          channel.connectedAccountId,
        );

        if (!isDefined(connectedAccount)) {
          return [];
        }

        const conversationStyle = isDefined(
          channel.messagingProviderUniversalIdentifier,
        )
          ? (conversationStyleByMessagingProviderUniversalIdentifier.get(
              channel.messagingProviderUniversalIdentifier,
            ) ?? null)
          : null;

        return [
          [
            channel.id,
            {
              type: channel.type,
              provider: connectedAccount.provider,
              applicationId: connectedAccount.applicationId ?? null,
              conversationStyle,
            },
          ],
        ];
      }),
    );
  }

  public async getThreadVisibilityAndChannelByThreadId({
    messageThreadIds,
    userWorkspaceId,
    workspaceId,
  }: {
    messageThreadIds: string[];
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<{
    threadVisibilityByThreadId: Record<string, MessageChannelVisibility>;
    threadChannelByThreadId: Record<string, TimelineThreadChannelDTO>;
  }> {
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageThreadRepository =
        this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<MessageThreadWorkspaceEntity>(
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
        .orderBy('messageChannelMessageAssociation.messageChannelId')
        .getRawMany<{ id: string; messageChannelId: string | null }>();

      const allMessageChannelIds = [
        ...new Set(
          threadChannelRows
            .map((row) => row.messageChannelId)
            .filter((id): id is string => isDefined(id)),
        ),
      ];

      if (allMessageChannelIds.length === 0) {
        return { threadVisibilityByThreadId: {}, threadChannelByThreadId: {} };
      }

      const messageChannels = await this.messageChannelRepository.find({
        where: { id: In(allMessageChannelIds), workspaceId },
        select: {
          id: true,
          visibility: true,
          connectedAccountId: true,
          type: true,
          messagingProviderUniversalIdentifier: true,
        },
      });

      const allConnectedAccountIds = [
        ...new Set(
          messageChannels.map((channel) => channel.connectedAccountId),
        ),
      ];

      const connectedAccounts = await this.connectedAccountRepository.find({
        where: { id: In(allConnectedAccountIds), workspaceId },
        select: {
          id: true,
          userWorkspaceId: true,
          provider: true,
          applicationId: true,
        },
      });

      const ownedAccountIds = new Set(
        connectedAccounts
          .filter((account) => account.userWorkspaceId === userWorkspaceId)
          .map((account) => account.id),
      );

      const channelById = await this.buildChannelByMessageChannelId({
        workspaceId,
        messageChannels,
        connectedAccounts,
      });

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

      const threadVisibilityByThreadId: Record<
        string,
        MessageChannelVisibility
      > = {};
      const threadChannelByThreadId: Record<string, TimelineThreadChannelDTO> =
        {};

      for (const { id: threadId, messageChannelId } of threadChannelRows) {
        if (!messageChannelId) {
          continue;
        }

        const channel = channelById.get(messageChannelId);

        if (
          isDefined(channel) &&
          !isDefined(threadChannelByThreadId[threadId])
        ) {
          threadChannelByThreadId[threadId] = channel;
        }

        const channelVisibility = channelVisibilityMap.get(messageChannelId);

        if (!channelVisibility) {
          continue;
        }

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

      return { threadVisibilityByThreadId, threadChannelByThreadId };
    }, buildSystemAuthContext(workspaceId));
  }
}
