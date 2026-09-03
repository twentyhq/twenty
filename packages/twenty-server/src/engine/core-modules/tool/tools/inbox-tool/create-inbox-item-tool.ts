import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  InboxException,
  InboxExceptionCode,
} from 'src/engine/core-modules/inbox/inbox.exception';
import { InboxQueueService } from 'src/engine/core-modules/inbox/services/inbox-queue.service';
import { InboxRouterService } from 'src/engine/core-modules/inbox/services/inbox-router.service';
import { type InboxPrincipalRef } from 'src/engine/core-modules/inbox/types/route-inbox-item.type';
import { CreateInboxItemToolInputZodSchema } from 'src/engine/core-modules/tool/tools/inbox-tool/inbox-tool.schema';
import { type CreateInboxItemToolInput } from 'src/engine/core-modules/tool/tools/inbox-tool/types/create-inbox-item-tool-input.type';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';

@Injectable()
export class CreateInboxItemTool implements Tool {
  private readonly logger = new Logger(CreateInboxItemTool.name);

  description =
    "Put a piece of work in someone's inbox: an approval to grant, a question to answer, something to look at. Name an assignee or a shared inbox, or neither to let the workspace routing decide. Reuse a slotKey to keep updating one item instead of creating another.";
  inputSchema = CreateInboxItemToolInputZodSchema;

  constructor(
    private readonly inboxRouterService: InboxRouterService,
    private readonly inboxQueueService: InboxQueueService,
  ) {}

  async execute(
    parameters: CreateInboxItemToolInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    try {
      const inboxItem = await this.inboxRouterService.routeOrThrow({
        workspaceId: context.workspaceId,
        typeKey: parameters.typeKey,
        title: parameters.title,
        preview: parameters.preview,
        priority: parameters.priority,
        slotKey: parameters.slotKey,
        target: await this.resolveTarget(parameters, context.workspaceId),
      });

      return {
        success: true,
        message: `Inbox item "${inboxItem.title}" created`,
        result: {
          inboxItemId: inboxItem.id,
          title: inboxItem.title,
          queueId: inboxItem.queueId ?? undefined,
          assigneeUserWorkspaceId:
            inboxItem.assigneeUserWorkspaceId ?? undefined,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to create inbox item: ${error}`);

      return {
        success: false,
        message: 'Failed to create inbox item',
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create inbox item',
      };
    }
  }

  // A named recipient that does not resolve is an error rather than a fallback
  // to routing: work addressed to one person landing in a shared inbox is worse
  // than the step failing where its author can see it.
  //
  // Callers name a workspace member because that is the identity they can see;
  // the inbox addresses user workspaces.
  private async resolveTarget(
    parameters: CreateInboxItemToolInput,
    workspaceId: string,
  ): Promise<InboxPrincipalRef | undefined> {
    if (isDefined(parameters.assigneeWorkspaceMemberId)) {
      const userWorkspaceId = await this.inboxRouterService.toUserWorkspaceId({
        workspaceId,
        workspaceMemberId: parameters.assigneeWorkspaceMemberId,
      });

      if (!isDefined(userWorkspaceId)) {
        throw new InboxException(
          `Workspace member ${parameters.assigneeWorkspaceMemberId} is not a member of this workspace`,
          InboxExceptionCode.UNKNOWN_INBOX_RECIPIENT,
        );
      }

      return { kind: 'userWorkspace', userWorkspaceId };
    }

    if (isDefined(parameters.queueId)) {
      const queue = await this.inboxQueueService.findQueueOrThrow({
        workspaceId,
        queueId: parameters.queueId,
      });

      return { kind: 'queue', queueId: queue.id };
    }

    return undefined;
  }
}
