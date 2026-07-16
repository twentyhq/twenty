import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ServerFileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { type ApplicationRegistrationGalleryImage } from 'src/engine/core-modules/application/application-registration/types/application-registration-gallery-image.type';
import { isStorableAssetPath } from 'src/engine/core-modules/application/application-registration/utils/is-storable-asset-path.util';
import { toGalleryImagePaths } from 'src/engine/core-modules/application/application-registration/utils/to-gallery-image-paths.util';
import { FileStorageException } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { ServerFileStorageService } from 'src/engine/core-modules/file-storage/services/server-file-storage.service';
import { prepareFileForStorageOrThrow } from 'src/engine/core-modules/file-storage/utils/prepare-file-for-storage-or-throw.util';
import type { ApplicationManifest } from 'twenty-shared/application';

export type ReadRegistrationAsset = (path: string) => Promise<Buffer | null>;

// Copies the manifest logo and gallery images into instance-global server file
// storage so their display URLs can be built at query time from fileIds,
// regardless of how the registration was created (LOCAL, TARBALL, NPM).
@Injectable()
export class ApplicationRegistrationAssetService {
  private readonly logger = new Logger(
    ApplicationRegistrationAssetService.name,
  );

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly serverFileStorageService: ServerFileStorageService,
  ) {}

  async storeRegistrationAssets({
    applicationRegistrationId,
    manifestApplication,
    readAsset,
    skipAlreadyStoredPaths = false,
  }: {
    applicationRegistrationId: string;
    manifestApplication: ApplicationManifest | undefined;
    readAsset: ReadRegistrationAsset;
    // Set when asset contents are known to be unchanged (same package
    // version): assets that already have a stored file for the same path are
    // not re-downloaded, only missing ones are.
    skipAlreadyStoredPaths?: boolean;
  }): Promise<void> {
    const logoPath = manifestApplication?.logo ?? manifestApplication?.logoUrl;

    const logoFileId = isDefined(logoPath)
      ? await this.storeAssetFile({
          applicationRegistrationId,
          path: logoPath,
          readAsset,
          skipAlreadyStoredPaths,
        })
      : null;

    const galleryImages: ApplicationRegistrationGalleryImage[] = [];

    for (const path of toGalleryImagePaths(manifestApplication)) {
      const fileId = await this.storeAssetFile({
        applicationRegistrationId,
        path,
        readAsset,
        skipAlreadyStoredPaths,
      });

      // Entries without a fileId (absolute URLs, missing files) are kept so
      // the query-time URL resolution can still fall back on the raw path.
      galleryImages.push({ path, fileId });
    }

    await this.applicationRegistrationRepository.update(
      applicationRegistrationId,
      {
        logoFileId,
        galleryImages,
      } as QueryDeepPartialEntity<ApplicationRegistrationEntity>,
    );
  }

  private async storeAssetFile({
    applicationRegistrationId,
    path,
    readAsset,
    skipAlreadyStoredPaths,
  }: {
    applicationRegistrationId: string;
    path: string;
    readAsset: ReadRegistrationAsset;
    skipAlreadyStoredPaths: boolean;
  }): Promise<string | null> {
    if (!isStorableAssetPath(path)) {
      return null;
    }

    if (skipAlreadyStoredPaths) {
      const alreadyStoredFileId = await this.findStoredAssetFileId({
        applicationRegistrationId,
        path,
      });

      if (isDefined(alreadyStoredFileId)) {
        return alreadyStoredFileId;
      }
    }

    try {
      const contents = await readAsset(path);

      if (!isDefined(contents)) {
        return this.keepPreviouslyStoredAssetFileId({
          applicationRegistrationId,
          path,
        });
      }

      const { sourceFile, mimeType } = await prepareFileForStorageOrThrow({
        sourceFile: contents,
        resourcePath: path,
      });

      const savedFile = await this.serverFileStorageService.writeServerFile({
        fileFolder: ServerFileFolder.ApplicationRegistration,
        applicationRegistrationId,
        resourcePath: path,
        contents: Buffer.isBuffer(sourceFile)
          ? sourceFile
          : Buffer.from(sourceFile),
        mimeType,
      });

      return savedFile.id;
    } catch (error) {
      this.logger.warn(
        `Failed to store asset "${path}" for registration ${applicationRegistrationId}: ${error.message}`,
      );

      return this.keepPreviouslyStoredAssetFileId({
        applicationRegistrationId,
        path,
      });
    }
  }

  // A transient read/download failure must not clobber a working asset: the
  // file previously stored for the same path is kept. When the path changed,
  // no file exists for it and the asset correctly resolves to null.
  private async keepPreviouslyStoredAssetFileId({
    applicationRegistrationId,
    path,
  }: {
    applicationRegistrationId: string;
    path: string;
  }): Promise<string | null> {
    const previouslyStoredFileId = await this.findStoredAssetFileId({
      applicationRegistrationId,
      path,
    });

    if (isDefined(previouslyStoredFileId)) {
      this.logger.warn(
        `Keeping previously stored file for asset "${path}" of registration ${applicationRegistrationId}`,
      );
    }

    return previouslyStoredFileId;
  }

  private async findStoredAssetFileId({
    applicationRegistrationId,
    path,
  }: {
    applicationRegistrationId: string;
    path: string;
  }): Promise<string | null> {
    try {
      const storedFile = await this.serverFileStorageService.findServerFile({
        fileFolder: ServerFileFolder.ApplicationRegistration,
        applicationRegistrationId,
        resourcePath: path,
      });

      return storedFile?.id ?? null;
    } catch (error) {
      // Only an invalid path means "nothing stored for this path"; transient
      // lookup failures must propagate so a working fileId is never cleared.
      if (error instanceof FileStorageException) {
        return null;
      }

      throw error;
    }
  }
}
