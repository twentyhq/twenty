import { Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import {
  assertMatchingDependencyChecksumsOrThrow,
  type DependencyChecksums,
} from 'src/engine/core-modules/application/application-package/utils/assert-matching-dependency-checksums-or-throw.util';
import { computeApplicationPackageChecksums } from 'src/engine/core-modules/application/application-package/utils/compute-application-package-checksums.util';
import { computeLegacyApplicationPackageChecksums } from 'src/engine/core-modules/application/application-package/utils/compute-legacy-application-package-checksums.util';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

type ApplicationIdentifier = {
  workspaceId: string;
  applicationUniversalIdentifier: string;
};

type StoredDependencyChecksums = {
  packageJsonChecksum: string;
  yarnLockChecksum: string | null;
};

type StoredDependencyFiles = {
  packageJsonContent: string;
  yarnLockContent: string | null;
  storedFilesChecksums: StoredDependencyChecksums;
};

@Injectable()
export class ApplicationDependencyFilesService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  async getVerifiedDependencyContentsOrThrow({
    workspaceId,
    applicationUniversalIdentifier,
    declaredChecksums,
  }: ApplicationIdentifier & {
    declaredChecksums: DependencyChecksums;
  }): Promise<StoredDependencyFiles> {
    const { packageJsonContent, yarnLockContent, storedFilesChecksums } =
      await this.getDependencyContents({
        workspaceId,
        applicationUniversalIdentifier,
      });

    assertMatchingDependencyChecksumsOrThrow({
      applicationUniversalIdentifier,
      declaredChecksums,
      storedFilesChecksums,
      legacyStoredFilesChecksums: computeLegacyApplicationPackageChecksums({
        packageJsonContent,
        yarnLockContent,
      }),
    });

    return { packageJsonContent, yarnLockContent, storedFilesChecksums };
  }

  async computeStoredDependencyChecksums(
    applicationIdentifier: ApplicationIdentifier,
  ): Promise<StoredDependencyChecksums> {
    const { storedFilesChecksums } = await this.getDependencyContents(
      applicationIdentifier,
    );

    return storedFilesChecksums;
  }

  private async getDependencyContents({
    workspaceId,
    applicationUniversalIdentifier,
  }: ApplicationIdentifier): Promise<StoredDependencyFiles> {
    const readDependencyFile = async (resourcePath: string) =>
      (
        await streamToBuffer(
          await this.fileStorageService.readFile({
            workspaceId,
            applicationUniversalIdentifier,
            fileFolder: FileFolder.Dependencies,
            resourcePath,
          }),
        )
      ).toString('utf-8');

    const isYarnLockStored = await this.fileStorageService.checkFileExists({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.Dependencies,
      resourcePath: 'yarn.lock',
    });

    const [packageJsonContent, yarnLockContent] = await Promise.all([
      readDependencyFile('package.json'),
      isYarnLockStored ? readDependencyFile('yarn.lock') : null,
    ]);

    return {
      packageJsonContent,
      yarnLockContent,
      storedFilesChecksums: computeApplicationPackageChecksums({
        packageJsonContent,
        yarnLockContent,
      }),
    };
  }
}
