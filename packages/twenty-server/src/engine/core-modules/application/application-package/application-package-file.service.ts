import { Injectable, Logger } from '@nestjs/common';

import { join } from 'path';

import semver from 'semver';
import { type Manifest } from 'twenty-shared/application';
import { ServerFileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { buildApplicationPackageFileList } from 'src/engine/core-modules/application/application-package/utils/build-application-package-file-list.util';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { ServerFileStorageService } from 'src/engine/core-modules/file-storage/services/server-file-storage.service';
import { prepareFileForStorageOrThrow } from 'src/engine/core-modules/file-storage/utils/prepare-file-for-storage-or-throw.util';
import { validateFilePath } from 'src/engine/core-modules/file-storage/utils/validate-file-path.util';

export type ReadApplicationPackageFile = (
  relativePath: string,
) => Promise<Buffer>;

// Stores the files of an application package (built logic functions, built
// front components, public assets, package.json) in instance-global server
// storage, keyed by registration and version, so every workspace installing
// the same version shares a single stored copy.
@Injectable()
export class ApplicationPackageFileService {
  private readonly logger = new Logger(ApplicationPackageFileService.name);

  constructor(
    private readonly serverFileStorageService: ServerFileStorageService,
  ) {}

  // Package contents are immutable per (registration, version): npm versions
  // cannot be republished and tarball deploys must bump the version. Files
  // already stored for this version are skipped, so installing the same
  // version from another workspace stores nothing new.
  async ensurePackageFilesStored({
    applicationRegistrationId,
    version,
    manifest,
    readPackageFile,
  }: {
    applicationRegistrationId: string;
    version: string;
    manifest: Manifest;
    readPackageFile: ReadApplicationPackageFile;
  }): Promise<void> {
    const parsedVersion = semver.parse(version);

    if (!isDefined(parsedVersion)) {
      throw new ApplicationException(
        `Invalid application package version "${version}". Must be a valid semver version.`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    // parsedVersion.version drops build metadata ("1.2.3+build" -> "1.2.3"):
    // "+" is not a safe path character, and semver ignores build metadata for
    // precedence so it can never distinguish two installable versions.
    const versionPathSegment = parsedVersion.version;

    const packageFiles = buildApplicationPackageFileList(manifest);

    // Validated upfront so an invalid manifest stores nothing at all.
    for (const { relativePath, fileFolder } of packageFiles) {
      const validationResult = validateFilePath({
        resourcePath: relativePath,
        fileFolder,
      });

      if (!validationResult.isValid) {
        throw new FileStorageException(
          validationResult.error,
          FileStorageExceptionCode.ACCESS_DENIED,
        );
      }
    }

    const storedResourcePaths = new Set(
      await this.serverFileStorageService.listStoredResourcePaths({
        fileFolder: ServerFileFolder.ApplicationPackage,
        applicationRegistrationId,
      }),
    );

    let storedFileCount = 0;

    for (const { relativePath, fileFolder } of packageFiles) {
      const resourcePath = join(versionPathSegment, fileFolder, relativePath);

      if (storedResourcePaths.has(resourcePath)) {
        continue;
      }

      const contents = await readPackageFile(relativePath);

      const { sourceFile, mimeType } = await prepareFileForStorageOrThrow({
        sourceFile: contents,
        resourcePath: relativePath,
      });

      await this.serverFileStorageService.writeServerFile({
        fileFolder: ServerFileFolder.ApplicationPackage,
        applicationRegistrationId,
        resourcePath,
        contents: Buffer.isBuffer(sourceFile)
          ? sourceFile
          : Buffer.from(sourceFile),
        mimeType,
      });

      storedFileCount += 1;
    }

    if (storedFileCount > 0) {
      this.logger.log(
        `Stored ${storedFileCount} package file(s) for registration ${applicationRegistrationId} version ${version}`,
      );
    }
  }
}
