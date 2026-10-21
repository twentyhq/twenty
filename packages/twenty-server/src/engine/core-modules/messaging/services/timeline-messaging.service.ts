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
import { type TimelineThreadDTO } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';
import { getEffectiveMessageChannelVisibility } from 'src/engine/core-modules/messaging/utils/get-effective-message-channel-visibility.util';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type TargetFilter } from 'src/engine/core-modules/target/utils/get-target-field-name-for-object-record.util';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

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
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
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

      const applyRecordFilter = (
        queryBuilder: WorkspaceSelectQueryBuilder,
      ): void => {
        if (isDefined(targetFilter)) {
          queryBuilder
            .innerJoin(
              'messageThread.messageThreadTargets',
              'messageThreadTargets',
            )
            .where(
              `messageThreadTargets.${targetFilter.fieldName} = :targetRecordId`,
              { targetRecordId: targetFilter.recordId },
            );

          return;
        }

        queryBuilder
          .innerJoin('messages.messageParticipants', 'messageParticipants')
          .where('messageParticipants.personId IN(:...personIds)', {
            personIds,
          });
      };

      applyRecordFilter(totalQueryBuilder);
      applyRecordFilter(threadIdsQueryBuilder);

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
    limit,
  }: {
    workspaceId: string;
    searchInput: string;
    messageChannelIds: string[];
    recordFilter?: { targetFilter?: TargetFilter; personIds: string[] };
    excludedMessageThreadIds?: string[];
    limit: number;
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

      if (isDefined(recordFilter?.targetFilter)) {
        queryBuilder
          .innerJoin(
            'messageThread.messageThreadTargets',
            'messageThreadTargets',
          )
          .andWhere(
            `messageThreadTargets.${recordFilter.targetFilter.fieldName} = :targetRecordId`,
            { targetRecordId: recordFilter.targetFilter.recordId },
          );
      } else if (isDefined(recordFilter)) {
        queryBuilder
          .innerJoin('messages.messageParticipants', 'messageParticipants')
          .andWhere('messageParticipants.personId IN (:...personIds)', {
            personIds: recordFilter.personIds,
          });
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
        .limit(limit)
        .getRawMany<{ id: string }>();

      const messageThreads = await this.findMessageThreadsByIds(
        threadIdsQuery.map((thread) => thread.id),
      );

      const messageThreadById = new Map(
        messageThreads.map((messageThread) => [
          messageThread.id,
          messageThread,
        ]),
      );

      return threadIdsQuery
        .map(({ id }) => messageThreadById.get(id))
        .filter(isDefined);
    }, buildSystemAuthContext(workspaceId));
  }

  public async getSearchableMessageChannelIds(
    workspaceMemberId: string,
    workspaceId: string,
  ): Promise<{
    ownedMessageChannelIds: string[];
    subjectVisibleMessageChannelIds: string[];
  }> {
    const currentUserWorkspaceId = await this.getCurrentUserWorkspaceId({
      workspaceMemberId,
      workspaceId,
    });

    const [ownedConnectedAccounts, messageChannels] = await Promise.all([
      isDefined(currentUserWorkspaceId)
        ? this.connectedAccountRepository.find({
            where: { userWorkspaceId: currentUserWorkspaceId, workspaceId },
            select: { id: true },
          })
        : [],
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

  private async getCurrentUserWorkspaceId({
    workspaceMemberId,
    workspaceId,
  }: {
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<string | undefined> {
    const currentUserId =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workspaceMemberRepository =
          this.workspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        const currentMember = await workspaceMemberRepository.findOne({
          where: { id: workspaceMemberId },
          select: { userId: true },
        });

        return currentMember?.userId;
      }, buildSystemAuthContext(workspaceId));

    if (!isDefined(currentUserId)) {
      return undefined;
    }

    const currentUserWorkspace = await this.userWorkspaceRepository.findOne({
      where: { userId: currentUserId, workspaceId },
      select: { id: true },
    });

    return currentUserWorkspace?.id;
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

    return messageThreads.map((messageThread) => {
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

  public async getThreadVisibilityByThreadId(
    messageThreadIds: string[],
    workspaceMemberId: string,
    workspaceId: string,
  ): Promise<{
    [key: string]: MessageChannelVisibility;
  }> {
    const currentUserWorkspaceId = await this.getCurrentUserWorkspaceId({
      workspaceMemberId,
      workspaceId,
    });

    if (!isDefined(currentUserWorkspaceId)) {
      return {};
    }

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
              userWorkspaceId: currentUserWorkspaceId,
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
