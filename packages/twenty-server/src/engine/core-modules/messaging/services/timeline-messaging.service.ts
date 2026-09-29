import { Injectable } from '@nestjs/common';

import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import {
  MessageChannelVisibility,
  MessageParticipantRole,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { type TimelineThreadDTO } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';
import { type TargetFilter } from 'src/engine/core-modules/target/utils/get-target-field-name-for-object-record.util';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

export type TimelineThreadWithoutParticipants = Omit<
  TimelineThreadDTO,
  'firstParticipant' | 'lastTwoParticipants' | 'participantCount' | 'read'
>;

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
      const messageThreadRepository =
        this.workspaceOrmManager.getRepositoryWithContextPermissions<MessageThreadWorkspaceEntity>(
          'messageThread',
          undefined,
          'existence',
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

      let totalNumberOfThreads: number;
      let messageThreadIds: string[];

      try {
        totalNumberOfThreads = await totalQueryBuilder.getCount();
        messageThreadIds = (
          await threadIdsQueryBuilder.getRawMany<{ id: string }>()
        ).map((thread) => thread.id);
      } catch (error) {
        if (error instanceof PermissionsException) {
          return { messageThreads: [], totalNumberOfThreads: 0 };
        }

        throw error;
      }

      if (messageThreadIds.length === 0) {
        return { messageThreads: [], totalNumberOfThreads };
      }

      const messages = await this.workspaceOrmManager
        .getRepositoryWithContextPermissions<MessageWorkspaceEntity>(
          'message',
          undefined,
          'existence',
        )
        .createQueryBuilder('message')
        .select([
          'message.id',
          'message.messageThreadId',
          'message.receivedAt',
          'message.isDraft',
        ])
        .where('message.messageThreadId IN (:...messageThreadIds)', {
          messageThreadIds,
        })
        .orderBy('message.receivedAt', 'DESC')
        .getMany<
          Pick<
            MessageWorkspaceEntity,
            'id' | 'messageThreadId' | 'receivedAt' | 'isDraft'
          >
        >();

      const messageContentById =
        await this.findReadableMessageContentById(messageThreadIds);

      return {
        messageThreads: messageThreadIds.flatMap((messageThreadId) => {
          const threadMessages = messages.filter(
            (message) => message.messageThreadId === messageThreadId,
          );
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

  // A role that cannot read subjects or bodies sees every thread as unshared.
  private async findReadableMessageContentById(
    messageThreadIds: string[],
  ): Promise<Map<string, Pick<MessageWorkspaceEntity, 'subject' | 'text'>>> {
    try {
      const messages = await this.workspaceOrmManager
        .getRepositoryWithContextPermissions<MessageWorkspaceEntity>('message')
        .createQueryBuilder('message')
        .select(['message.id', 'message.subject', 'message.text'])
        .where('message.messageThreadId IN (:...messageThreadIds)', {
          messageThreadIds,
        })
        .getMany<Pick<MessageWorkspaceEntity, 'id' | 'subject' | 'text'>>();

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
