import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { type InboxItemToolCallInput } from 'src/engine/core-modules/inbox/types/inbox-item-tool-call-input.type';
import { type InboxItemToolCallOutput } from 'src/engine/core-modules/inbox/types/inbox-item-tool-call-output.type';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';

export type InboxToolCallExecutionResult =
  | { status: 'EXECUTED'; output: InboxItemToolCallOutput }
  | { status: 'FAILED'; error: string };

// The approver's own role decides what the call may touch, so the context is
// built from the person who ran the plan rather than from whoever proposed it.
// An agent that could not have made this change itself does not get to make it
// by asking someone with more access to approve.
@Injectable()
export class InboxToolCallExecutionService {
  constructor(
    // The inbox is a leaf that the tool module imports, so reaching back into
    // the registry closes a cycle that only Nest can untie.
    @Inject(forwardRef(() => ToolRegistryService))
    private readonly toolRegistryService: ToolRegistryService,
    private readonly agentActorContextService: AgentActorContextService,
  ) {}

  async execute({
    workspaceId,
    actorUserWorkspaceId,
    toolName,
    input,
  }: {
    workspaceId: string;
    actorUserWorkspaceId: string;
    toolName: string;
    input: InboxItemToolCallInput;
  }): Promise<InboxToolCallExecutionResult> {
    const { actorContext, roleId, userId, userContext } =
      await this.agentActorContextService.buildUserAndAgentActorContext(
        actorUserWorkspaceId,
        workspaceId,
      );

    // An unknown tool comes back as an unsuccessful output rather than a
    // throw, so it lands on the row like any other failed call.
    const toolOutput = await this.toolRegistryService.resolveAndExecute(
      toolName,
      input,
      {
        workspaceId,
        roleId,
        actorContext,
        userId,
        userWorkspaceId: actorUserWorkspaceId,
        locale: userContext.locale as keyof typeof APP_LOCALES,
      },
      { compactOutput: true },
    );

    if (toolOutput.success !== true) {
      // A tool is free to fail with neither field filled in, and a FAILED row
      // with nothing written on it is one the person cannot act on.
      const error = [toolOutput.error, toolOutput.message].find(
        isNonEmptyString,
      );

      return {
        status: 'FAILED',
        error: error ?? `Tool ${toolName} failed without reporting a reason`,
      };
    }

    return {
      status: 'EXECUTED',
      output: {
        ...(isNonEmptyString(toolOutput.message)
          ? { message: toolOutput.message }
          : {}),
        ...(isDefined(toolOutput.result) ? { result: toolOutput.result } : {}),
        ...(isDefined(toolOutput.warnings)
          ? { warnings: toolOutput.warnings }
          : {}),
      },
    };
  }
}
