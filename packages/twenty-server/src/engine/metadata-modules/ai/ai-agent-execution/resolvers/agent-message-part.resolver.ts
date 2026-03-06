import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { FileFolder } from 'twenty-shared/types';

import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AgentMessagePartDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-message-part.dto';
import { AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';

@Resolver(() => AgentMessagePartDTO)
export class AgentMessagePartResolver {
  constructor(private readonly fileUrlService: FileUrlService) {}

  @ResolveField(() => String, { nullable: true })
  fileUrl(
    @Parent() part: AgentMessagePartEntity,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): string | null {
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
  fileMediaType(@Parent() part: AgentMessagePartEntity): string | null {
    return part.file?.mimeType ?? null;
  }
}
