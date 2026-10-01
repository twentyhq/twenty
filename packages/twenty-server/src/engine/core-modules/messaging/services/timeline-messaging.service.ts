import { Injectable } from '@nestjs/common';

import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import {
  MessageChannelVisibility,
  MessageParticipantRole,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import groupBy from 'lodash.groupby';
import { In } from 'typeorm';

import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { type TimelineThreadWithoutParticipants } from 'src/engine/core-modules/messaging/types/timeline-thread-without-participants.type';
import { type TargetFilter } from 'src/engine/core-modules/target/utils/get-target-field-name-for-object-record.util';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

type DiscoveredThreadPage = {
  totalNumberOfThreads: number;
  messageThreadIds: string[];
  messages: Pick<
    MessageWorkspaceEntity,
    'id' | 'messageThreadId' | 'receivedAt' | 'isDraft'
  >[];
};

@Injectable()
export class TimelineMessagingService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly fileUrlService: FileUrlService,
  ) {}

  // Runs as the caller: the existence read lists every thread their role can
  // read, and record shares decide which ones show a subject and a body.
  public async getAndCountMessageThreads(
    personIds: string[],
    offset: number,
    pageSize: number,
    targetFilter?: TargetFilter,
  ): Promise<{
    messageThreads: TimelineThreadWithoutParticipants[];
    totalNumberOfThreads: number;
  }> {
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      let discoveredThreads: DiscoveredThreadPage;

      try {
        discoveredThreads = await this.findDiscoverableThreads({
          personIds,
          offset,
          pageSize,
          targetFilter,
        });
      } catch (error) {
        if (error instanceof PermissionsException) {
          return { messageThreads: [], totalNumberOfThreads: 0 };
        }

        throw error;
      }

      const { totalNumberOfThreads, messageThreadIds, messages } =
        discoveredThreads;

      if (messageThreadIds.length === 0) {
        return { messageThreads: [], totalNumberOfThreads };
      }

      const messagesByThreadId = groupBy(
        messages,
        (message) => message.messageThreadId,
      );
      const messageContentById = await this.findReadableMessageContentById(
        Object.values(messagesByThreadId).flatMap((threadMessages) => [
          threadMessages[0].id,
          threadMessages[threadMessages.length - 1].id,
        ]),
      );

      return {
        messageThreads: messageThreadIds.flatMap((messageThreadId) => {
          const threadMessages = messagesByThreadId[messageThreadId] ?? [];
          const lastMessage = threadMessages[0];
          const firstMessage = threadMessages[threadMessages.length - 1];

          if (!isDefined(lastMessage) || !isDefined(firstMessage)) {
            return [];
          }

          const firstMessageContent = messageContentById.get(firstMessage.id);
          const lastMessageContent = messageContentById.get(lastMessage.id);
          const isShared =
            isDefined(firstMessageContent) && isDefined(lastMessageContent);

          return [
            {
              id: messageThreadId,
              subject: isShared
                ? (firstMessageContent.subject ?? '')
                : FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
              lastMessageBody: isShared
                ? (lastMessageContent.text ?? '')
                : FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
              lastMessageReceivedAt: lastMessage.receivedAt ?? new Date(),
              numberOfMessagesInThread: threadMessages.length,
              lastMessageIsDraft: lastMessage.isDraft ?? false,
              visibility: isShared
                ? MessageChannelVisibility.SHARE_EVERYTHING
                : MessageChannelVisibility.METADATA,
            },
          ];
        }),
        totalNumberOfThreads,
      };
    });
  }

  private async findDiscoverableThreads({
    personIds,
    offset,
    pageSize,
    targetFilter,
  }: {
    personIds: string[];
    offset: number;
    pageSize: number;
    targetFilter?: TargetFilter;
  }): Promise<DiscoveredThreadPage> {
    const messageThreadRepository =
      this.workspaceOrmManager.getRepositoryWithContextPermissions<MessageThreadWorkspaceEntity>(
        'messageThread',
        undefined,
        'existence',
      );

    const totalQueryBuilder = messageThreadRepository
      .createQueryBuilder('messageThread')
      .select('messageThread.id', 'id')
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
    const messageThreadIds = (
      await threadIdsQueryBuilder.getRawMany<{ id: string }>()
    ).map((thread) => thread.id);

    if (messageThreadIds.length === 0) {
      return { totalNumberOfThreads, messageThreadIds, messages: [] };
    }

    const messages = await this.workspaceOrmManager
      .getRepositoryWithContextPermissions<MessageWorkspaceEntity>(
        'message',
        undefined,
        'existence',
      )
      .find({
        where: { messageThreadId: In(messageThreadIds) },
        select: {
          id: true,
          messageThreadId: true,
          receivedAt: true,
          isDraft: true,
        },
        order: { receivedAt: 'DESC' },
      });

    return { totalNumberOfThreads, messageThreadIds, messages };
  }

  // A role that cannot read subjects or bodies sees every thread as unshared.
  private async findReadableMessageContentById(
    messageIds: string[],
  ): Promise<Map<string, Pick<MessageWorkspaceEntity, 'subject' | 'text'>>> {
    try {
      const messages = await this.workspaceOrmManager
        .getRepositoryWithContextPermissions<MessageWorkspaceEntity>('message')
        .find({
          where: { id: In(messageIds) },
          select: { id: true, subject: true, text: true },
        });

      return new Map(messages.map((message) => [message.id, message]));
    } catch (error) {
      if (error instanceof PermissionsException) {
        return new Map();
      }

      throw error;
    }
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
}
