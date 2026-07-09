import { detectPdf } from '@file-type/pdf';
import { Command } from 'nest-commander';
import { FileTypeParser } from 'file-type';
import { isNonEmptyString } from '@sniptt/guards';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IsNull, MoreThan, Not } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { FilesFieldService } from 'src/engine/core-modules/file/files-field/services/files-field.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { getImageBufferFromUrl } from 'src/utils/image';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

const PERSON_BATCH_SIZE = 100;
const MIN_UUID = '00000000-0000-0000-0000-000000000000';

@RegisteredWorkspaceCommand('2.20.0', 1783541976846)
@Command({
  name: 'upgrade:2-20:migrate-person-avatar-url-to-avatar-file',
  description:
    'Migrate legacy person.avatarUrl (external image URL) into the avatarFile FILES field for existing workspaces.',
})
export class MigratePersonAvatarUrlToAvatarFileCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly filesFieldService: FilesFieldService,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

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

    const personRepository =
      await this.twentyORMGlobalManager.getRepository<PersonWorkspaceEntity>(
        workspaceId,
        'person',
        { shouldBypassPermissionChecks: true },
      );

    let cursor = MIN_UUID;
    let candidateCount = 0;
    let migratedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (;;) {
      const persons = await personRepository.find({
        select: ['id', 'avatarUrl', 'avatarFile'],
        where: { id: MoreThan(cursor), avatarUrl: Not(IsNull()) },
        order: { id: 'ASC' },
        take: PERSON_BATCH_SIZE,
      });

      if (persons.length === 0) {
        break;
      }

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
    fieldMetadataUniversalIdentifier: string | undefined;
    personRepository: WorkspaceRepository<PersonWorkspaceEntity>;
  }): Promise<'migrated' | 'skipped' | 'failed'> {
    const imageData = await this.downloadImage(avatarUrl);

    if (!isDefined(imageData)) {
      return 'skipped';
    }

    const filename = `avatar.${imageData.extension}`;

    let uploadedFile;

    try {
      uploadedFile = await this.filesFieldService.uploadFile({
        file: imageData.buffer,
        filename,
        workspaceId,
        fieldMetadataUniversalIdentifier,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to upload migrated avatar for person ${personId} in workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
      );

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

  private async downloadImage(
    imageUrl: string,
  ): Promise<{ buffer: Buffer; extension: string } | undefined> {
    try {
      const httpClient = this.secureHttpClientService.getHttpClient({
        retries: 2,
        shouldResetTimeout: true,
      });

      const buffer = await getImageBufferFromUrl(imageUrl, httpClient);

      const parser = new FileTypeParser({ customDetectors: [detectPdf] });
      const type = await parser.fromBuffer(buffer);

      if (!isDefined(type) || !type.mime.startsWith('image/')) {
        return undefined;
      }

      return { buffer, extension: type.ext };
    } catch {
      this.logger.warn('Failed to fetch avatar image.');

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
