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
  }: {
    applicationRegistrationId: string;
    manifestApplication: ApplicationManifest | undefined;
    readAsset: ReadRegistrationAsset;
  }): Promise<void> {
    const existing = await this.applicationRegistrationRepository.findOneOrFail(
      {
        select: ['id', 'logo', 'logoFileId', 'galleryImages'],
        where: { id: applicationRegistrationId },
      },
    );

    const logoFileId = await this.storeLogoFile({
      applicationRegistrationId,
      manifestApplication,
      readAsset,
    });

    const galleryImages = await this.storeGalleryImageFiles({
      applicationRegistrationId,
      manifestApplication,
      readAsset,
    });

    // A transient read/download failure must not clobber a working asset:
    // keep the previously stored fileId when the path did not change.
    const logoPath = manifestApplication?.logo ?? manifestApplication?.logoUrl;
    const existingFileIdByPath = new Map(
      (existing.galleryImages ?? []).map(({ path, fileId }) => [path, fileId]),
    );

    await this.applicationRegistrationRepository.update(
      applicationRegistrationId,
      {
        logoFileId:
          logoFileId ??
          (isDefined(logoPath) &&
          isStorableAssetPath(logoPath) &&
          existing.logo === logoPath
            ? existing.logoFileId
            : null),
        galleryImages: galleryImages.map((galleryImage) => ({
          ...galleryImage,
          fileId:
            galleryImage.fileId ??
            existingFileIdByPath.get(galleryImage.path) ??
            null,
        })),
      } as QueryDeepPartialEntity<ApplicationRegistrationEntity>,
    );
  }

  private async storeLogoFile({
    applicationRegistrationId,
    manifestApplication,
    readAsset,
  }: {
    applicationRegistrationId: string;
    manifestApplication: ApplicationManifest | undefined;
    readAsset: ReadRegistrationAsset;
  }): Promise<string | null> {
    const logoPath = manifestApplication?.logo ?? manifestApplication?.logoUrl;

    if (!isDefined(logoPath)) {
      return null;
    }

    return this.storeAssetFile({
      applicationRegistrationId,
      path: logoPath,
      readAsset,
    });
  }

  private async storeGalleryImageFiles({
    applicationRegistrationId,
    manifestApplication,
    readAsset,
  }: {
    applicationRegistrationId: string;
    manifestApplication: ApplicationManifest | undefined;
    readAsset: ReadRegistrationAsset;
  }): Promise<ApplicationRegistrationGalleryImage[]> {
    const galleryImages: ApplicationRegistrationGalleryImage[] = [];

    for (const path of toGalleryImagePaths(manifestApplication)) {
      const fileId = await this.storeAssetFile({
        applicationRegistrationId,
        path,
        readAsset,
      });

      // Entries without a fileId (absolute URLs, missing files) are kept so
      // the query-time URL resolution can still fall back on the raw path.
      galleryImages.push({ path, fileId });
    }

    return galleryImages;
  }

  private async storeAssetFile({
    applicationRegistrationId,
    path,
    readAsset,
  }: {
    applicationRegistrationId: string;
    path: string;
    readAsset: ReadRegistrationAsset;
  }): Promise<string | null> {
    if (!isStorableAssetPath(path)) {
      return null;
    }

    try {
      const contents = await readAsset(path);

      if (!isDefined(contents)) {
        return null;
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

      return null;
    }
  }
}
