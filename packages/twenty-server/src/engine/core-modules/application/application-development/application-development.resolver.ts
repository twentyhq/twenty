import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { PermissionFlagType } from 'twenty-shared/constants';

import type { FileUpload } from 'graphql-upload/processRequest.mjs';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationDevelopmentService } from 'src/engine/core-modules/application/application-development/application-development.service';
import { ApplicationFileUploadService } from 'src/engine/core-modules/application/application-development/application-file-upload.service';
import { ApplicationFileUploadTargetDTO } from 'src/engine/core-modules/application/application-development/dtos/application-file-upload-target.dto';
import { ApplicationInput } from 'src/engine/core-modules/application/application-development/dtos/application.input';
import { CompleteApplicationFileUploadsInput } from 'src/engine/core-modules/application/application-development/dtos/complete-application-file-uploads.input';
import { CreateApplicationFileUploadsInput } from 'src/engine/core-modules/application/application-development/dtos/create-application-file-uploads.input';
import { CreateDevelopmentApplicationInput } from 'src/engine/core-modules/application/application-development/dtos/create-development-application.input';
import { DevelopmentApplicationDTO } from 'src/engine/core-modules/application/application-development/dtos/development-application.dto';
import { UploadApplicationFileInput } from 'src/engine/core-modules/application/application-development/dtos/upload-application-file.input';
import { WorkspaceMigrationDTO } from 'src/engine/core-modules/application/application-development/dtos/workspace-migration.dto';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { FileDTO } from 'src/engine/core-modules/file/dtos/file.dto';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseInterceptors(WorkspaceMigrationGraphqlApiExceptionInterceptor)
@UseFilters(ApplicationExceptionFilter)
@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
)
export class ApplicationDevelopmentResolver {
  constructor(
    private readonly applicationDevelopmentService: ApplicationDevelopmentService,
    private readonly applicationFileUploadService: ApplicationFileUploadService,
  ) {}

  @Mutation(() => DevelopmentApplicationDTO)
  async createDevelopmentApplication(
    @Args() { universalIdentifier, name }: CreateDevelopmentApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<DevelopmentApplicationDTO> {
    return this.applicationDevelopmentService.createDevelopmentApplication({
      universalIdentifier,
      name,
      workspaceId,
    });
  }

  @Mutation(() => WorkspaceMigrationDTO)
  async syncApplication(
    @Args() { manifest, dryRun }: ApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<WorkspaceMigrationDTO> {
    return this.applicationDevelopmentService.syncApplication({
      manifest,
      dryRun,
      workspaceId,
    });
  }

  @Mutation(() => FileDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.UPLOAD_FILE))
  async uploadApplicationFile(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream }: FileUpload,
    @Args()
    {
      applicationUniversalIdentifier,
      fileFolder,
      filePath,
    }: UploadApplicationFileInput,
  ): Promise<FileDTO> {
    return this.applicationDevelopmentService.uploadApplicationFile({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder,
      filePath,
      getFileBuffer: () => streamToBuffer(createReadStream()),
    });
  }

  @Mutation(() => [ApplicationFileUploadTargetDTO])
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.UPLOAD_FILE))
  async createApplicationFileUploads(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args() {
      applicationUniversalIdentifier,
      files,
    }: CreateApplicationFileUploadsInput,
  ): Promise<ApplicationFileUploadTargetDTO[]> {
    return this.applicationFileUploadService.createApplicationFileUploads({
      workspaceId,
      applicationUniversalIdentifier,
      files,
    });
  }

  @Mutation(() => [FileDTO])
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.UPLOAD_FILE))
  async completeApplicationFileUploads(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args() {
      applicationUniversalIdentifier,
      fileIds,
    }: CompleteApplicationFileUploadsInput,
  ): Promise<FileDTO[]> {
    return this.applicationFileUploadService.completeApplicationFileUploads({
      workspaceId,
      applicationUniversalIdentifier,
      fileIds,
    });
  }
}
