import { Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { Command } from 'nest-commander';
import { FileFolder } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { DataSource, In, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-type.enum';

type WorkflowFile = {
  id: string;
  path?: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
};

type SendEmailStep = {
  id: string;
  type: WorkflowActionType.SEND_EMAIL;
  settings: {
    input: {
      files?: WorkflowFile[];
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

@Command({
  name: 'upgrade:1-18:migrate-workflow-send-email-attachments',
  description:
    'Migrate workflow send email attachments to FileFolder.Workflow and update payload paths',
})
export class MigrateWorkflowSendEmailAttachmentsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(
    MigrateWorkflowSendEmailAttachmentsCommand.name,
  );

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly fileStorageService: FileStorageService,
    private readonly applicationService: ApplicationService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const isMigrated = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_OTHER_FILE_MIGRATED,
      workspaceId,
    );

    if (isMigrated) {
      this.logger.log(
        `Workflow attachments migration already completed for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Starting workflow send email attachments migration for workspace ${workspaceId}`,
    );

    const workflowVersionRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersions = await workflowVersionRepository.find({
      select: ['id', 'steps'],
      where: {
        status: In([
          WorkflowVersionStatus.DRAFT,
          WorkflowVersionStatus.ACTIVE,
          WorkflowVersionStatus.DEACTIVATED,
        ]),
      },
    });

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const fileRepository = this.coreDataSource.getRepository(FileEntity);

    for (const workflowVersion of workflowVersions) {
      const steps = workflowVersion.steps;

      if (!isNonEmptyArray(steps)) {
        continue;
      }

      for (const step of steps) {
        if (step.type !== WorkflowActionType.SEND_EMAIL) {
          continue;
        }

        const sendEmailStep = step as SendEmailStep;
        const files = sendEmailStep.settings?.input?.files;

        if (!isNonEmptyArray(files)) {
          continue;
        }

        for (const file of files) {
          const fileEntity = await fileRepository.findOne({
            where: {
              id: file.id,
              workspaceId,
            },
          });

          if (!isDefined(fileEntity)) {
            this.logger.warn(
              `File ${file.id} not found for workflow version ${workflowVersion.id}, skipping`,
            );
            continue;
          }

          if (fileEntity.path.startsWith(FileFolder.Workflow)) {
            this.logger.log(
              `File ${file.id} already in Workflow folder, skipping copy`,
            );
            continue;
          }

          const newResourcePath = `${fileEntity.id}${isNonEmptyString(file.type) ? `.${file.type}` : ''}`;
          const newPath = `${FileFolder.Workflow}/${newResourcePath}`;

          if (!isDryRun) {
            try {
              await this.fileStorageService.copyLegacy({
                from: {
                  folderPath: `workspace-${workspaceId}`,
                  filename: fileEntity.path,
                },
                to: {
                  folderPath: `${workspaceId}/${workspaceCustomFlatApplication.universalIdentifier}`,
                  filename: newPath,
                },
              });
            } catch (error) {
              this.logger.error(
                `Failed to migrate file ${fileEntity.id} in workspace ${workspaceId}: ${error.message}`,
              );
              continue;
            }
          } else {
            this.logger.log(
              `[DRY RUN] Would migrate file ${fileEntity.id} from ${fileEntity.path} to ${newPath}`,
            );
          }

          await fileRepository.update(
            { id: fileEntity.id },
            {
              path: newPath,
              applicationId: workspaceCustomFlatApplication.id,
              settings: {
                isTemporaryFile: true,
                toDelete: false,
              },
            },
          );
        }
      }
    }

    if (!isDryRun) {
      await this.featureFlagService.enableFeatureFlags(
        [FeatureFlagKey.IS_OTHER_FILE_MIGRATED],
        workspaceId,
      );
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Completed workflow send email attachments migration for workspace ${workspaceId}`,
    );
  }
}
