import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { PermissionFlagType } from 'twenty-shared/constants';

import type { FileUpload } from 'graphql-upload/processRequest.mjs';

import { FileDTO } from 'src/engine/core-modules/file/dtos/file.dto';
import { FilesFieldService } from 'src/engine/core-modules/file/files-field/files-field.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
@Resolver()
export class FilesFieldResolver {
  constructor(private readonly filesFieldService: FilesFieldService) {}

  @Mutation(() => FileDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.UPLOAD_FILE))
  async uploadFilesFieldFile(
    @AuthWorkspace()
    { id: workspaceId }: WorkspaceEntity,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
    @Args({
      name: 'fieldMetadataId',
      type: () => String,
      nullable: false,
    })
    fieldMetadataId: string,
  ): Promise<FileDTO> {
    const stream = createReadStream();
    const buffer = await streamToBuffer(stream);

    return await this.filesFieldService.uploadFile({
      file: buffer,
      filename,
      declaredMimeType: mimetype,
      workspaceId,
      fieldMetadataId,
    });
  }
}
