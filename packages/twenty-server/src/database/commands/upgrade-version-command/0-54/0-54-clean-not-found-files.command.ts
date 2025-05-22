import { InjectRepository } from '@nestjs/typeorm';

import { basename, dirname } from 'path';

import { isNonEmptyString } from '@sniptt/guards';
import { Command } from 'nest-commander';
import { Equal, Not, Repository } from 'typeorm';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

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
import { Readable } from 'cloudflare/_shims';

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
    await this.cleanWorkspaceLogo(workspaceId, dryRun);
    await this.softDeleteAttachments(workspaceId, dryRun);
    await this.cleanWorkspaceMembersAvatarUrl(workspaceId, dryRun);
    await this.cleanPeopleAvatarUrl(workspaceId, dryRun);
  }

  private async checkIfFileIsFound(path: string, workspaceId: string) {
    if (path.startsWith('https://')) return true; // seed data

    try {
      const fileStream = await this.fileService.getFileStream(
        dirname(path),
        basename(path),
        workspaceId,
      );

      fileStream.on('data', () => {
        (fileStream as unknown as Readable).destroy();
      });
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

  private async cleanWorkspaceLogo(workspaceId: string, dryRun: boolean) {
    const workspace = await this.workspaceRepository.findOneOrFail({
      where: {
        id: workspaceId,
      },
    });

    if (!isNonEmptyString(workspace.logo)) return;

    this.logger.log('Processing workspace logo for workspace', workspace.id);

    const isFileFound = await this.checkIfFileIsFound(
      workspace.logo,
      workspace.id,
    );

    if (isFileFound) return;

    if (!dryRun)
      await this.workspaceRepository.update(workspace.id, {
        logo: '',
      });

    this.logger.log(
      `${dryRun ? 'Dry run - ' : ''}Set logo to '' for workspace ${workspace.id}`,
    );
  }

  private async softDeleteAttachments(workspaceId: string, dryRun: boolean) {
    const attachmentRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<AttachmentWorkspaceEntity>(
        workspaceId,
        'attachment',
      );
    const attachmentsCount = await attachmentRepository.count();
    const chunkSize = 10;

    const attachmentIdsToSoftDelete: string[] = [];

    for (let offset = 0; offset < attachmentsCount; offset += chunkSize) {
      const attachmentsChunk = await attachmentRepository.find({
        skip: offset,
        take: chunkSize,
      });

      const attachmentIdsToSoftDeleteChunk = await Promise.all(
        attachmentsChunk.map(async (attachment) => {
          this.logger.log('Processing attachment', attachment.id);
          const isFileFound = await this.checkIfFileIsFound(
            attachment.fullPath,
            workspaceId,
          );

          return isFileFound ? '' : attachment.id;
        }),
      );

      attachmentIdsToSoftDelete.push(
        ...attachmentIdsToSoftDeleteChunk.filter(isNonEmptyString),
      );
    }

    if (attachmentIdsToSoftDelete.length === 0) return;

    if (!dryRun)
      await attachmentRepository.softDelete(attachmentIdsToSoftDelete);

    this.logger.log(
      `${dryRun ? 'Dry run - ' : ''}Deleted attachments ${attachmentIdsToSoftDelete.join(', ')}`,
    );
  }

  private async cleanWorkspaceMembersAvatarUrl(
    workspaceId: string,
    dryRun: boolean,
  ) {
    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
      );
    const workspaceMembers = await workspaceMemberRepository.find({
      where: {
        avatarUrl: Not(Equal('')),
      },
    });

    const workspaceMemberIdsToUpdate: string[] = [];

    for (const workspaceMember of workspaceMembers) {
      this.logger.log('Processing workspaceMember', workspaceMember.id);

      const isFileFound = await this.checkIfFileIsFound(
        workspaceMember.avatarUrl,
        workspaceId,
      );

      if (isFileFound) continue;

      workspaceMemberIdsToUpdate.push(workspaceMember.id);
    }

    if (workspaceMemberIdsToUpdate.length === 0) return;

    if (!dryRun)
      await workspaceMemberRepository.update(workspaceMemberIdsToUpdate, {
        avatarUrl: '',
      });

    this.logger.log(
      `${dryRun ? 'Dry run - ' : ''}Set avatarUrl to '' for workspaceMembers ${workspaceMemberIdsToUpdate.join(', ')}`,
    );
  }

  private async cleanPeopleAvatarUrl(workspaceId: string, dryRun: boolean) {
    const personRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<PersonWorkspaceEntity>(
        workspaceId,
        'person',
      );
    const people = await personRepository.find({
      where: {
        avatarUrl: Not(Equal('')),
      },
    });

    const personIdsToUpdate: string[] = [];

    for (const person of people) {
      this.logger.log('Processing person', person.id);

      const isFileFound = await this.checkIfFileIsFound(
        person.avatarUrl,
        workspaceId,
      );

      if (!isFileFound) {
        personIdsToUpdate.push(person.id);
      }
    }

    if (personIdsToUpdate.length === 0) return;

    if (!dryRun)
      await personRepository.update(personIdsToUpdate, {
        avatarUrl: '',
      });

    this.logger.log(
      `${dryRun ? 'Dry run - ' : ''}Set avatarUrl to '' for people ${personIdsToUpdate.join(', ')}`,
    );
  }
}
