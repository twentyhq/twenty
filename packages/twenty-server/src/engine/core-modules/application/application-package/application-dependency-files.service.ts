import { Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import {
  assertMatchingDependencyChecksumsOrThrow,
  type DependencyChecksums,
} from 'src/engine/core-modules/application/application-package/utils/assert-matching-dependency-checksums-or-throw.util';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

type ApplicationIdentifier = {
  workspaceId: string;
  applicationUniversalIdentifier: string;
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
  }): Promise<{
    packageJsonContent: string;
    yarnLockContent: string | null;
    storedFilesChecksums: {
      packageJsonChecksum: string;
      yarnLockChecksum: string | null;
    };
  }> {
    const { packageJsonContent, yarnLockContent } =
      await this.getDependencyContents({
        workspaceId,
        applicationUniversalIdentifier,
      });

    const storedFilesChecksums = assertMatchingDependencyChecksumsOrThrow({
      applicationUniversalIdentifier,
      declaredChecksums,
      packageJsonContent,
      yarnLockContent,
    });

    return { packageJsonContent, yarnLockContent, storedFilesChecksums };
  }

  private async getDependencyContents({
    workspaceId,
    applicationUniversalIdentifier,
  }: ApplicationIdentifier): Promise<{
    packageJsonContent: string;
    yarnLockContent: string | null;
  }> {
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

    return { packageJsonContent, yarnLockContent };
  }
}
