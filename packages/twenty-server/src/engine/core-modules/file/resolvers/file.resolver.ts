import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { FileDTO } from 'src/engine/core-modules/file/dtos/file.dto';
import { FileMetadataService } from 'src/engine/core-modules/file/services/file-metadata.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
@Resolver()
export class FileResolver {
  constructor(private readonly fileMetadataService: FileMetadataService) {}

  @Mutation(() => FileDTO)
  async createFile(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('name') name: string,
    @Args('fullPath') fullPath: string,
    @Args('size') size: number,
    @Args('type') type: string,
  ): Promise<FileDTO> {
    const fileRecord = await this.fileMetadataService.createFile({
      name,
      fullPath,
      size,
      type,
      workspaceId,
    });

    return fileRecord;
  }

  @Mutation(() => FileDTO, { nullable: true })
  async deleteFile(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('fileId') fileId: string,
  ): Promise<FileDTO | null> {
    const deletedFile = await this.fileMetadataService.deleteFileById(
      fileId,
      workspaceId,
    );

    return deletedFile;
  }
}
