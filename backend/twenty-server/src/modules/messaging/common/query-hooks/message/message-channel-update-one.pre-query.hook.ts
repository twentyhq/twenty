import { Logger } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { Not } from 'typeorm';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import {
  WorkspaceQueryRunnerException,
  WorkspaceQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { MessageChannelDataAccessService } from 'src/engine/metadata-modules/message-channel/data-access/services/message-channel-data-access.service';
import { MessageFolderDataAccessService } from 'src/engine/metadata-modules/message-folder/data-access/services/message-folder-data-access.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageFolderPendingSyncAction } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { MessagingProcessGroupEmailActionsService } from 'src/modules/messaging/message-import-manager/services/messaging-process-group-email-actions.service';

const ONGOING_SYNC_STAGES = [
  MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
];

@WorkspaceQueryHook(`messageChannel.updateOne`)
export class MessageChannelUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  private readonly logger = new Logger(
    MessageChannelUpdateOnePreQueryHook.name,
  );

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messageChannelDataAccessService: MessageChannelDataAccessService,
    private readonly messageFolderDataAccessService: MessageFolderDataAccessService,
    private readonly messagingProcessGroupEmailActionsService: MessagingProcessGroupEmailActionsService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<MessageChannelWorkspaceEntity>,
  ): Promise<UpdateOneResolverArgs<MessageChannelWorkspaceEntity>> {
    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const systemAuthContext = buildSystemAuthContext(workspace.id);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const messageChannel =
          await this.messageChannelDataAccessService.findOne(workspace.id, {
            where: { id: payload.id },
          });

        if (!isDefined(messageChannel)) {
          throw new WorkspaceQueryRunnerException(
            'Message channel not found',
            WorkspaceQueryRunnerExceptionCode.DATA_NOT_FOUND,
            {
              userFriendlyMessage: msg`Message channel not found`,
            },
          );
        }

        const messageChannelWorkspace =
          messageChannel as unknown as MessageChannelWorkspaceEntity;

        const isSyncOngoing = ONGOING_SYNC_STAGES.includes(
          messageChannelWorkspace.syncStage,
        );

        const messageFoldersWithPendingAction =
          await this.messageFolderDataAccessService.find(workspace.id, {
            messageChannelId: messageChannel.id,
            pendingSyncAction: Not(MessageFolderPendingSyncAction.NONE),
          });

        const messageFoldersWithPendingActionCount =
          messageFoldersWithPendingAction.length;

        const hasPendingFolderActions =
          messageFoldersWithPendingActionCount > 0;

        const hasPendingGroupEmailsAction =
          messageChannelWorkspace.pendingGroupEmailsAction !==
          MessageChannelPendingGroupEmailsAction.NONE;

        if (
          isSyncOngoing &&
          (hasPendingFolderActions || hasPendingGroupEmailsAction)
        ) {
          throw new WorkspaceQueryRunnerException(
            'Cannot update message channel while sync is ongoing with pending actions',
            WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
            {
              userFriendlyMessage: msg`Cannot update message channel while sync is ongoing. Please wait for the sync to complete.`,
            },
          );
        }

        const hasCompletedConfiguration =
          messageChannelWorkspace.syncStage !==
          MessageChannelSyncStage.PENDING_CONFIGURATION;

        if (!hasCompletedConfiguration) {
          this.logger.log(
            `MessageChannelId: ${messageChannelWorkspace.id} - Skipping pending action for message channel in PENDING_CONFIGURATION state`,
          );

          return payload;
        }

        const excludeGroupEmailsChanged =
          isDefined(payload.data.excludeGroupEmails) &&
          payload.data.excludeGroupEmails !==
            messageChannelWorkspace.excludeGroupEmails;

        if (excludeGroupEmailsChanged) {
          await this.messagingProcessGroupEmailActionsService.markMessageChannelAsPendingGroupEmailsAction(
            messageChannelWorkspace,
            workspace.id,
            payload.data.excludeGroupEmails
              ? MessageChannelPendingGroupEmailsAction.GROUP_EMAILS_DELETION
              : MessageChannelPendingGroupEmailsAction.GROUP_EMAILS_IMPORT,
          );
        }

        return payload;
      },
      systemAuthContext,
    );
  }
}
