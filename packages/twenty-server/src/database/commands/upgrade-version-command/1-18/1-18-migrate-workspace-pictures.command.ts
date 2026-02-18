import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import FileType from 'file-type';
import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FileFolder } from 'twenty-shared/types';
import {
  extractFolderPathFilenameAndTypeOrThrow,
  isDefined,
} from 'twenty-shared/utils';
import { And, DataSource, IsNull, Like, Not, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { getImageBufferFromUrl } from 'src/utils/image';

@Command({
  name: 'upgrade:1-18:migrate-workspace-pictures',
  description:
    'Migrate workspace logos and workspace member avatars to file records',
})
export class MigrateWorkspacePicturesCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly fileStorageService: FileStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationService: ApplicationService,
    private readonly fileUrlService: FileUrlService,
    private readonly secureHttpClientService: SecureHttpClientService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const isMigrated = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_CORE_PICTURE_MIGRATED,
      workspaceId,
    );

    if (isMigrated) {
      this.logger.log(
        `Workspace pictures migration already completed for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Starting workspace pictures migration for workspace ${workspaceId}`,
    );

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const fileRepository = this.coreDataSource.getRepository(FileEntity);

    await this.migrateWorkspaceLogo({
      workspaceId,
      isDryRun,
      workspaceCustomFlatApplication,
      fileRepository,
    });

    await this.migrateWorkspaceMemberAvatars({
      workspaceId,
      isDryRun,
      workspaceCustomFlatApplication,
      fileRepository,
    });

    if (!isDryRun) {
      await this.featureFlagService.enableFeatureFlags(
        [FeatureFlagKey.IS_CORE_PICTURE_MIGRATED],
        workspaceId,
      );
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Completed workspace pictures migration for workspace ${workspaceId}`,
    );
  }

  private async migrateWorkspaceLogo({
    workspaceId,
    isDryRun,
    workspaceCustomFlatApplication,
    fileRepository,
  }: {
    workspaceId: string;
    isDryRun: boolean;
    workspaceCustomFlatApplication: FlatApplication;
    fileRepository: Repository<FileEntity>;
  }): Promise<void> {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
        logo: Not(IsNull()),
        logoFileId: IsNull(),
      },
    });

    if (!workspace || !isNonEmptyString(workspace.logo)) {
      this.logger.log(
        `No workspace logo to migrate for workspace ${workspaceId}`,
      );

      return;
    }

    const isInWorkspaceLogo = workspace.logo.startsWith(
      FileFolder.WorkspaceLogo,
    );

    const isTwentyIconLogo = workspace.logo.includes('twenty-icons');

    if (!isTwentyIconLogo && !isInWorkspaceLogo) {
      this.logger.log(
        `Workspace logo is not a twenty icon or a workspace logo, skipping`,
      );

      return;
    }

    this.logger.log(
      `Migrating workspace logo for workspace ${workspaceId}: ${workspace.logo}`,
    );

    if (isInWorkspaceLogo) {
      await this.migrateWorkspaceLogoFromWorkspaceFolder({
        workspaceId,
        logoPath: workspace.logo,
        isDryRun,
        workspaceCustomFlatApplication,
        fileRepository,
      });
    }

    if (isTwentyIconLogo) {
      await this.migrateWorkspaceLogoFromTwentyIcons({
        workspaceId,
        logoUrl: workspace.logo,
        isDryRun,
        workspaceCustomFlatApplication,
      });
    }
  }

  private async migrateWorkspaceLogoFromWorkspaceFolder({
    workspaceId,
    logoPath,
    isDryRun,
    workspaceCustomFlatApplication,
    fileRepository,
  }: {
    workspaceId: string;
    logoPath: string;
    isDryRun: boolean;
    workspaceCustomFlatApplication: FlatApplication;
    fileRepository: Repository<FileEntity>;
  }): Promise<void> {
    try {
      const { type: fileExtension } =
        extractFolderPathFilenameAndTypeOrThrow(logoPath);

      const fileId = v4();
      const newFilename = `${fileId}${isNonEmptyString(fileExtension) ? `.${fileExtension}` : ''}`;
      const newResourcePath = `${FileFolder.CorePicture}/${newFilename}`;

      if (!isDryRun) {
        await this.fileStorageService.copyLegacy({
          from: {
            folderPath: `workspace-${workspaceId}`,
            filename: logoPath,
          },
          to: {
            folderPath: `${workspaceId}/${workspaceCustomFlatApplication.universalIdentifier}`,
            filename: newResourcePath,
          },
        });

        const fileEntity = fileRepository.create({
          id: fileId,
          path: newResourcePath,
          workspaceId,
          applicationId: workspaceCustomFlatApplication.id,
          size: -1,
          settings: {
            isTemporaryFile: false,
            toDelete: false,
          },
        });

        await fileRepository.save(fileEntity);

        await this.workspaceRepository.update(
          { id: workspaceId },
          { logoFileId: fileId },
        );
      }

      this.logger.log(
        `Migrated workspace logo for workspace ${workspaceId} (${logoPath} -> ${newResourcePath})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to migrate workspace logo for workspace ${workspaceId}: ${error.message}`,
      );
      throw error;
    }
  }

  private async migrateWorkspaceLogoFromTwentyIcons({
    workspaceId,
    logoUrl,
    isDryRun,
    workspaceCustomFlatApplication,
  }: {
    workspaceId: string;
    logoUrl: string;
    isDryRun: boolean;
    workspaceCustomFlatApplication: FlatApplication;
  }): Promise<void> {
    try {
      const httpClient = this.secureHttpClientService.getHttpClient();
      const buffer = await getImageBufferFromUrl(logoUrl, httpClient);

      const type = await FileType.fromBuffer(buffer);

      if (!isDefined(type) || !type.mime.startsWith('image/')) {
        this.logger.warn(
          `Unable to detect image type for workspace logo ${logoUrl}, skipping`,
        );

        return;
      }

      const fileId = v4();
      const newFilename = `${fileId}.${type.ext}`;
      const newResourcePath = `${newFilename}`;

      if (!isDryRun) {
        const fileEntity = await this.fileStorageService.writeFile({
          workspaceId,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          fileFolder: FileFolder.CorePicture,
          resourcePath: newResourcePath,
          sourceFile: buffer,
          mimeType: type.mime,
          fileId,
          settings: {
            isTemporaryFile: false,
            toDelete: false,
          },
        });

        await this.workspaceRepository.update(
          { id: workspaceId },
          { logoFileId: fileEntity.id },
        );
      }

      this.logger.log(
        `Migrated workspace logo from twenty-icons for workspace ${workspaceId} (${logoUrl} -> ${FileFolder.CorePicture}/${newResourcePath})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to migrate workspace logo from twenty-icons for workspace ${workspaceId}: ${error.message}`,
      );
    }
  }

  private async migrateWorkspaceMemberAvatars({
    workspaceId,
    isDryRun,
    workspaceCustomFlatApplication,
    fileRepository,
  }: {
    workspaceId: string;
    isDryRun: boolean;
    workspaceCustomFlatApplication: FlatApplication;
    fileRepository: Repository<FileEntity>;
  }): Promise<void> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const workspaceMemberObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECTS.workspaceMember.universalIdentifier,
      });

    if (!isDefined(workspaceMemberObjectMetadata)) {
      this.logger.warn(
        `Workspace member object metadata not found for workspace ${workspaceId}, skipping member avatar migration`,
      );

      return;
    }

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepository<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );

    const workspaceMembers = await workspaceMemberRepository.find({
      where: {
        avatarUrl: And(Not(IsNull()), Not(Like(`%${FileFolder.CorePicture}%`))),
      },
      select: ['id', 'avatarUrl'],
    });

    if (workspaceMembers.length === 0) {
      this.logger.log(
        `No workspace member avatars to migrate for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `Found ${workspaceMembers.length} workspace member avatar(s) to migrate in workspace ${workspaceId}`,
    );

    for (const workspaceMember of workspaceMembers) {
      if (!isNonEmptyString(workspaceMember.avatarUrl)) {
        this.logger.warn(
          `Skipping workspace member ${workspaceMember.id} - invalid avatarUrl`,
        );

        continue;
      }

      try {
        const { type: fileExtension } = extractFolderPathFilenameAndTypeOrThrow(
          workspaceMember.avatarUrl,
        );

        const fileId = v4();
        const newFilename = `${fileId}${isNonEmptyString(fileExtension) ? `.${fileExtension}` : ''}`;
        const newResourcePath = `${FileFolder.CorePicture}/${newFilename}`;

        if (!isDryRun) {
          await this.fileStorageService.copyLegacy({
            from: {
              folderPath: `workspace-${workspaceId}`,
              filename: workspaceMember.avatarUrl,
            },
            to: {
              folderPath: `${workspaceId}/${workspaceCustomFlatApplication.universalIdentifier}`,
              filename: newResourcePath,
            },
          });

          const fileEntity = fileRepository.create({
            id: fileId,
            path: newResourcePath,
            workspaceId,
            applicationId: workspaceCustomFlatApplication.id,
            size: -1,
            settings: {
              isTemporaryFile: false,
              toDelete: false,
            },
          });

          await fileRepository.save(fileEntity);

          const signedUrl = this.fileUrlService.signFileByIdUrl({
            fileId,
            workspaceId,
            fileFolder: FileFolder.CorePicture,
          });

          await workspaceMemberRepository.update(
            { id: workspaceMember.id },
            {
              avatarUrl: signedUrl,
            },
          );
        }

        this.logger.log(
          `Migrated workspace member avatar ${workspaceMember.id}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to migrate workspace member avatar ${workspaceMember.id} in workspace ${workspaceId}: ${error.message}`,
        );
        throw error;
      }
    }

    if (!isDryRun) {
      await this.featureFlagService.enableFeatureFlags(
        [FeatureFlagKey.IS_CORE_PICTURE_MIGRATED],
        workspaceId,
      );
    }
  }
}
