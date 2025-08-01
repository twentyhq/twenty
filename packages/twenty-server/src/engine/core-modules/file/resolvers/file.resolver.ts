import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { FileUpload, GraphQLUpload } from 'graphql-upload';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { FileDTO } from 'src/engine/core-modules/file/dtos/file.dto';
import { FileMetadataService } from 'src/engine/core-modules/file/services/file-metadata.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
@Resolver()
export class FileResolver {
  constructor(private readonly fileMetadataService: FileMetadataService) {}

  @Mutation(() => FileDTO)
  async createFile(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
  ): Promise<FileDTO> {
    const stream = createReadStream();
    const buffer = await streamToBuffer(stream);

    return this.fileMetadataService.createFile({
      file: buffer,
      filename,
      mimeType: mimetype,
      workspaceId,
    });
  }

  @Mutation(() => FileDTO)
  async deleteFile(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('fileId', { type: () => UUIDScalarType }) fileId: string,
  ): Promise<FileDTO> {
    const deletedFile = await this.fileMetadataService.deleteFileById(
      fileId,
      workspaceId,
    );

    if (!deletedFile) {
      throw new Error(`File with id ${fileId} not found`);
    }

    return deletedFile;
  }
}
