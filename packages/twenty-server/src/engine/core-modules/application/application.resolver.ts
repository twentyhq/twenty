import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import path, { join } from 'path';

import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FileFolder } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import type { FileUpload } from 'graphql-upload/processRequest.mjs';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-sync.service';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { ApplicationInput } from 'src/engine/core-modules/application/dtos/application.input';
import { InstallApplicationInput } from 'src/engine/core-modules/application/dtos/install-application.input';
import { UninstallApplicationInput } from 'src/engine/core-modules/application/dtos/uninstallApplicationInput';
import { UploadApplicationFileInput } from 'src/engine/core-modules/application/dtos/uploadApplicationFileInput';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileDTO } from 'src/engine/core-modules/file/dtos/file.dto';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { RequireFeatureFlag } from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
)
@UsePipes(ResolverValidationPipe)
@Resolver()
@UseInterceptors(WorkspaceMigrationGraphqlApiExceptionInterceptor)
@UseFilters(ApplicationExceptionFilter)
export class ApplicationResolver {
  constructor(
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly applicationService: ApplicationService,
    private readonly fileStorageService: FileStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}

  @Query(() => [ApplicationDTO])
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async findManyApplications(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.applicationService.findManyApplications(workspaceId);
  }

  @Query(() => ApplicationDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async findOneApplication(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return await this.applicationService.findOneApplication(id, workspaceId);
  }

  @Mutation(() => Boolean)
  async syncApplication(
    @Args() { manifest, packageJson, yarnLock }: ApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    await this.applicationSyncService.synchronizeFromManifest({
      workspaceId,
      manifest,
      yarnLock,
      packageJson,
    });

    return true;
  }

  @Mutation(() => Boolean)
  async installApplication(
    @Args() { workspaceMigration: { actions } }: InstallApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    if (
      featureFlagsMap[
        FeatureFlagKey.IS_APPLICATION_INSTALLATION_FROM_TARBALL_ENABLED
      ] !== true
    ) {
      throw new ApplicationException(
        'Application installation from tarball is not enabled',
        ApplicationExceptionCode.FORBIDDEN,
      );
    }

    await this.workspaceMigrationRunnerService.run({
      // @ts-expect-error ignoring until we implement a production ready validation schema for workspaceMigration
      actions,
      workspaceId,
    });

    return true;
  }

  @Mutation(() => Boolean)
  async uninstallApplication(
    @Args() { universalIdentifier }: UninstallApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    await this.applicationSyncService.uninstallApplication({
      applicationUniversalIdentifier: universalIdentifier,
      workspaceId,
    });

    return true;
  }

  @Mutation(() => FileDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.UPLOAD_FILE))
  async uploadApplicationFile(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, mimetype }: FileUpload,
    @Args()
    {
      applicationUniversalIdentifier,
      fileFolder,
      filePath,
    }: UploadApplicationFileInput,
  ): Promise<FileDTO> {
    const allowedApplicationFileFolders: FileFolder[] = [
      FileFolder.BuiltFunction,
      FileFolder.BuiltFrontComponent,
      FileFolder.Asset,
      FileFolder.Source,
    ];

    if (!allowedApplicationFileFolders.includes(fileFolder)) {
      throw new ApplicationException(
        `Invalid fileFolder for application file upload. Allowed values: ${allowedApplicationFileFolders.join(', ')}`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    const stream = createReadStream();
    const buffer = await streamToBuffer(stream);

    const dirname = path.dirname(filePath);

    const filename = path.basename(filePath);

    const folderPath = join(
      `workspace-${workspaceId}`,
      applicationUniversalIdentifier,
      fileFolder,
      dirname,
    );

    await this.fileStorageService.write({
      file: buffer,
      name: filename,
      folder: folderPath,
      mimeType: mimetype,
    });

    const createdFile = this.fileRepository.create({
      path: join(folderPath, filename),
      size: buffer.length,
      workspaceId,
    });

    return await this.fileRepository.save(createdFile);
  }
}
