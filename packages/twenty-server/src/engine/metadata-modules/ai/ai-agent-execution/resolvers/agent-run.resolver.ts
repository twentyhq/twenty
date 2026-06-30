import { UseGuards } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { RunAgentInputDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/run-agent.input';
import { RunAgentResultDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/run-agent-result.dto';
import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';

@UseGuards(WorkspaceAuthGuard, SettingsPermissionGuard(PermissionFlagType.AI))
@MetadataResolver()
export class AgentRunResolver {
  constructor(private readonly agentRunService: AgentRunService) {}

  @Mutation(() => RunAgentResultDTO)
  async runAgent(
    @Args('input') input: RunAgentInputDTO,
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
  ): Promise<RunAgentResultDTO> {
    return this.agentRunService.run({
      workspace,
      requestUserWorkspaceId: userWorkspaceId ?? null,
      input,
    });
  }
}
