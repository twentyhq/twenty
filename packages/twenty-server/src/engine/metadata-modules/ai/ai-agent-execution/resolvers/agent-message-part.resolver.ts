import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { FileFolder } from 'twenty-shared/types';

import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AgentMessagePartDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-message-part.dto';
import { AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';

@Resolver(() => AgentMessagePartDTO)
export class AgentMessagePartResolver {
  constructor(private readonly fileUrlService: FileUrlService) {}

  @ResolveField(() => Date)
  createdAt(@Parent() part: AgentMessagePartWorkspaceEntity): Date {
    return new Date(part.createdAt);
  }

  @ResolveField(() => String, { nullable: true })
  async fileUrl(
    @Parent() part: AgentMessagePartWorkspaceEntity,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string | null> {
    if (!part.fileId) {
      return null;
    }

    return this.fileUrlService.signFileByIdUrl({
      fileId: part.fileId,
      workspaceId: workspace.id,
      fileFolder: FileFolder.AgentChat,
    });
  }

  @ResolveField(() => String, { nullable: true })
  fileMediaType(
    @Parent() part: AgentMessagePartWorkspaceEntity,
  ): string | null {
    return part.file?.mimeType ?? null;
  }
}
