import { Command } from 'nest-commander';
import { isNonEmptyString } from '@sniptt/guards';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IsNull, MoreThan, Not } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { type FileWithSignedUrlDTO } from 'src/engine/core-modules/file/dtos/file-with-sign-url.dto';
import { FilesFieldService } from 'src/engine/core-modules/file/files-field/services/files-field.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { fetchImageWithTypeFromUrl } from 'src/utils/image';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

const PERSON_BATCH_SIZE = 100;
const MIN_UUID = '00000000-0000-0000-0000-000000000000';

@RegisteredWorkspaceCommand('2.22.0', 1783960128000)
@Command({
  name: 'upgrade:2-22:migrate-person-avatar-url-to-avatar-file',
  description:
    'Migrate legacy person.avatarUrl (external image URL) into the avatarFile FILES field for existing workspaces.',
})
export class MigratePersonAvatarUrlToAvatarFileCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly filesFieldService: FilesFieldService,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    if (!isDefined(dataSource)) {
      this.logger.log(
        `No workspace data source for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const personObject =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
      });

    if (!isDefined(personObject)) {
      this.logger.log(
        `person object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const avatarFileField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECTS.person.fields.avatarFile.universalIdentifier,
      });

    if (!isDefined(avatarFileField)) {
      this.logger.log(
        `avatarFile field not found on person for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const personRepository = dataSource.getRepository<PersonWorkspaceEntity>(
      'person',
      { shouldBypassPermissionChecks: true },
    );

    let candidateCount = 0;
    let migratedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    let cursor = MIN_UUID;
    let persons = await this.findPersonsWithAvatarUrlBatch({
      personRepository,
      cursor,
    });

    while (persons.length > 0) {
      cursor = persons[persons.length - 1].id;

      for (const person of persons) {
        const avatarUrl = person.avatarUrl;

        if (
          !isNonEmptyString(avatarUrl) ||
          isNonEmptyArray(person.avatarFile)
        ) {
          continue;
        }

        if (isDryRun) {
          candidateCount++;

          continue;
        }

        const result = await this.migratePersonAvatar({
          personId: person.id,
          avatarUrl,
          workspaceId,
          fieldMetadataUniversalIdentifier: avatarFileField.universalIdentifier,
          personRepository,
        });

        if (result === 'migrated') {
          migratedCount++;
        } else if (result === 'skipped') {
          skippedCount++;
        } else {
          failedCount++;
        }
      }

      persons = await this.findPersonsWithAvatarUrlBatch({
        personRepository,
        cursor,
      });
    }

    if (isDryRun) {
      if (candidateCount > 0) {
        this.logger.log(
          `[DRY RUN] person avatarUrl -> avatarFile for workspace ${workspaceId}: ${candidateCount} candidate(s) would be attempted (download/upload not performed, so migrated/skipped/failed is unknown)`,
        );
      }

      return;
    }

    if (migratedCount > 0 || skippedCount > 0 || failedCount > 0) {
      this.logger.log(
        `person avatarUrl -> avatarFile for workspace ${workspaceId}: ${migratedCount} migrated, ${skippedCount} skipped (unreachable/non-image), ${failedCount} failed`,
      );
    }
  }

  private async findPersonsWithAvatarUrlBatch({
    personRepository,
    cursor,
  }: {
    personRepository: WorkspaceRepository<PersonWorkspaceEntity>;
    cursor: string;
  }): Promise<PersonWorkspaceEntity[]> {
    return personRepository.find({
      select: ['id', 'avatarUrl', 'avatarFile'],
      where: { id: MoreThan(cursor), avatarUrl: Not(IsNull()) },
      order: { id: 'ASC' },
      take: PERSON_BATCH_SIZE,
    });
  }

  private async migratePersonAvatar({
    personId,
    avatarUrl,
    workspaceId,
    fieldMetadataUniversalIdentifier,
    personRepository,
  }: {
    personId: string;
    avatarUrl: string;
    workspaceId: string;
    fieldMetadataUniversalIdentifier: string;
    personRepository: WorkspaceRepository<PersonWorkspaceEntity>;
  }): Promise<'migrated' | 'skipped' | 'failed'> {
    const imageData = await this.downloadImage({
      imageUrl: avatarUrl,
      personId,
      workspaceId,
    });

    if (!isDefined(imageData)) {
      return 'skipped';
    }

    const filename = `avatar.${imageData.extension}`;

    const uploadedFile = await this.uploadAvatarFile({
      buffer: imageData.buffer,
      filename,
      workspaceId,
      fieldMetadataUniversalIdentifier,
      personId,
    });

    if (!isDefined(uploadedFile)) {
      return 'failed';
    }

    try {
      await personRepository.update(personId, {
        avatarFile: [
          {
            fileId: uploadedFile.id,
            label: filename,
            extension: imageData.extension,
          },
        ],
      });

      return 'migrated';
    } catch (error) {
      this.logger.warn(
        `Failed to attach migrated avatar for person ${personId} in workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
      );

      const isFileReferencedByPerson = await this.isAvatarFileReferenced({
        personId,
        fileId: uploadedFile.id,
        workspaceId,
        personRepository,
      });

      if (isFileReferencedByPerson) {
        return 'migrated';
      }

      await this.safeDeleteUploadedFile(uploadedFile.id, workspaceId);

      return 'failed';
    }
  }

  private async uploadAvatarFile({
    buffer,
    filename,
    workspaceId,
    fieldMetadataUniversalIdentifier,
    personId,
  }: {
    buffer: Buffer;
    filename: string;
    workspaceId: string;
    fieldMetadataUniversalIdentifier: string;
    personId: string;
  }): Promise<FileWithSignedUrlDTO | undefined> {
    try {
      return await this.filesFieldService.uploadFile({
        file: buffer,
        filename,
        workspaceId,
        fieldMetadataUniversalIdentifier,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to upload migrated avatar for person ${personId} in workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return undefined;
    }
  }

  private async isAvatarFileReferenced({
    personId,
    fileId,
    workspaceId,
    personRepository,
  }: {
    personId: string;
    fileId: string;
    workspaceId: string;
    personRepository: WorkspaceRepository<PersonWorkspaceEntity>;
  }): Promise<boolean> {
    try {
      const person = await personRepository.findOne({
        select: ['id', 'avatarFile'],
        where: { id: personId },
      });

      return (
        person?.avatarFile?.some((file) => file.fileId === fileId) ?? false
      );
    } catch (error) {
      this.logger.warn(
        `Failed to verify avatar file reference for person ${personId} in workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return true;
    }
  }

  private async downloadImage({
    imageUrl,
    personId,
    workspaceId,
  }: {
    imageUrl: string;
    personId: string;
    workspaceId: string;
  }): Promise<{ buffer: Buffer; extension: string } | undefined> {
    const httpClient = this.secureHttpClientService.getHttpClient({
      retries: 2,
      shouldResetTimeout: true,
    });

    try {
      return await fetchImageWithTypeFromUrl(imageUrl, httpClient);
    } catch {
      this.logger.warn(
        `Failed to fetch avatar image for person ${personId} in workspace ${workspaceId}, skipping`,
      );

      return undefined;
    }
  }

  private async safeDeleteUploadedFile(
    fileId: string,
    workspaceId: string,
  ): Promise<void> {
    try {
      await this.filesFieldService.deleteFilesFieldFile({
        fileId,
        workspaceId,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to delete orphaned avatar file ${fileId} in workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
