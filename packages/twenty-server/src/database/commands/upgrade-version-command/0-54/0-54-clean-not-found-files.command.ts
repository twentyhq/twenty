import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Command({
  name: 'upgrade:0-54:clean-not-found-files',
  description: 'Clean not found files',
})
export class CleanNotFoundFilesCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly fileService: FileService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    index,
    total,
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running command for workspace ${workspaceId} ${index + 1}/${total}`,
    );

    await this.cleanNotFoundFiles(workspaceId, !!options.dryRun);
  }

  private async cleanNotFoundFiles(workspaceId: string, dryRun: boolean) {
    const workspace = await this.workspaceRepository.findOneOrFail({
      where: {
        id: workspaceId,
      },
    });

    if (isDefined(workspace.logo)) {
      const isFileFound = await this.checkIfFileIsFound(
        FileFolder.ProfilePicture,
        workspace.logo,
        workspace.id,
      );

      if (!isFileFound) {
        if (!dryRun)
          await this.workspaceRepository.update(workspace.id, {
            logo: '',
          });

        this.logger.log(
          `${dryRun ? 'Dry run - ' : ''}Set logo to '' for workspace ${workspace.id}`,
        );
      }
    }

    const attachmentRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<AttachmentWorkspaceEntity>(
        workspaceId,
        'attachment',
      );
    const attachments = await attachmentRepository.find();

    for (const attachment of attachments) {
      const isFileFound = await this.checkIfFileIsFound(
        FileFolder.Attachment,
        attachment.fullPath,
        workspaceId,
      );

      if (!isFileFound) {
        if (!dryRun) await attachmentRepository.softDelete(attachment.id);

        this.logger.log(
          `${dryRun ? 'Dry run - ' : ''}Deleted attachment ${attachment.id}`,
        );
      }
    }

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
      );
    const workspaceMembers = await workspaceMemberRepository.find();

    for (const workspaceMember of workspaceMembers) {
      if (isDefined(workspaceMember.avatarUrl)) {
        const isFileFound = await this.checkIfFileIsFound(
          FileFolder.ProfilePicture,
          workspaceMember.avatarUrl,
          workspaceId,
        );

        if (!isFileFound) {
          if (!dryRun)
            await workspaceMemberRepository.update(workspaceMember.id, {
              avatarUrl: '',
            });

          this.logger.log(
            `${dryRun ? 'Dry run - ' : ''}Set avatarUrl to '' for workspaceMember ${workspaceMember.id}`,
          );
        }
      }
    }

    const personRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<PersonWorkspaceEntity>(
        workspaceId,
        'person',
      );
    const persons = await personRepository.find();

    for (const person of persons) {
      if (isDefined(person.avatarUrl)) {
        const isFileFound = await this.checkIfFileIsFound(
          FileFolder.ProfilePicture,
          person.avatarUrl,
          workspaceId,
        );

        if (!isFileFound) {
          if (!dryRun)
            await personRepository.update(person.id, { avatarUrl: '' });

          this.logger.log(
            `${dryRun ? 'Dry run - ' : ''}Set avatarUrl to '' for person ${person.id}`,
          );
        }
      }
    }
  }

  private async checkIfFileIsFound(
    folderPath: string,
    filename: string,
    workspaceId: string,
  ) {
    if (filename.startsWith('https://')) return true; // seed data

    try {
      await this.fileService.getFileStream(folderPath, filename, workspaceId);
    } catch (error) {
      if (
        error instanceof FileStorageException &&
        error.code === FileStorageExceptionCode.FILE_NOT_FOUND
      ) {
        return false;
      }
    }

    return true;
  }
}
