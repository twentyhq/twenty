import { Injectable, Logger } from '@nestjs/common';

import { basename, dirname, join } from 'path';

import { FileFolder } from 'twenty-shared/types';

import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

export type ApplicationDependencyFiles = {
  packageJsonContent: string;
  yarnLockContent: string;
};

type ApplicationStorageScope = {
  workspaceId: string;
  applicationUniversalIdentifier: string;
};

const DEPENDENCY_FILE_NAMES = {
  packageJson: 'package.json',
  yarnLock: 'yarn.lock',
} as const;

@Injectable()
export class ApplicationTransferStorageService {
  private readonly logger = new Logger(ApplicationTransferStorageService.name);

  constructor(
    private readonly fileStorageDriverFactory: FileStorageDriverFactory,
    private readonly fileStorageService: FileStorageService,
  ) {}

  // Copies object by object so the destination never silently overwrites anything
  async copyFilesOrThrow({
    workspaceId,
    sourceApplicationUniversalIdentifier,
    destinationApplicationUniversalIdentifier,
    filePaths,
  }: {
    workspaceId: string;
    sourceApplicationUniversalIdentifier: string;
    destinationApplicationUniversalIdentifier: string;
    filePaths: string[];
  }): Promise<{ copiedFilePaths: string[]; missingFilePaths: string[] }> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const copiedFilePaths: string[] = [];
    const missingFilePaths: string[] = [];

    try {
      for (const filePath of filePaths) {
        const sourceStoragePath = join(
          workspaceId,
          sourceApplicationUniversalIdentifier,
          filePath,
        );
        const destinationStoragePath = join(
          workspaceId,
          destinationApplicationUniversalIdentifier,
          filePath,
        );

        if (
          await driver.checkFileExists({ filePath: destinationStoragePath })
        ) {
          throw new FileStorageException(
            `Destination object "${destinationStoragePath}" already exists`,
            FileStorageExceptionCode.ACCESS_DENIED,
          );
        }

        if (!(await driver.checkFileExists({ filePath: sourceStoragePath }))) {
          missingFilePaths.push(filePath);
          continue;
        }

        await driver.copy({
          from: {
            folderPath: dirname(sourceStoragePath),
            filename: basename(sourceStoragePath),
          },
          to: {
            folderPath: dirname(destinationStoragePath),
            filename: basename(destinationStoragePath),
          },
        });

        copiedFilePaths.push(filePath);
      }
    } catch (error) {
      await this.deleteFiles({
        workspaceId,
        applicationUniversalIdentifier:
          destinationApplicationUniversalIdentifier,
        filePaths: copiedFilePaths,
      });

      throw error;
    }

    return { copiedFilePaths, missingFilePaths };
  }

  async deleteFiles({
    workspaceId,
    applicationUniversalIdentifier,
    filePaths,
  }: ApplicationStorageScope & { filePaths: string[] }): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    for (const filePath of filePaths) {
      const storagePath = join(
        workspaceId,
        applicationUniversalIdentifier,
        filePath,
      );

      try {
        await driver.delete({
          folderPath: dirname(storagePath),
          filename: basename(storagePath),
        });
      } catch (error) {
        this.logger.error(
          `Failed to delete copied object "${storagePath}", remove it manually`,
          error,
        );
      }
    }
  }

  async readDependencyFiles(
    applicationStorageScope: ApplicationStorageScope,
  ): Promise<ApplicationDependencyFiles> {
    const [packageJsonContent, yarnLockContent] = await Promise.all(
      [DEPENDENCY_FILE_NAMES.packageJson, DEPENDENCY_FILE_NAMES.yarnLock].map(
        async (resourcePath) =>
          (
            await streamToBuffer(
              await this.fileStorageService.readFile({
                ...applicationStorageScope,
                fileFolder: FileFolder.Dependencies,
                resourcePath,
              }),
            )
          ).toString('utf8'),
      ),
    );

    return { packageJsonContent, yarnLockContent };
  }

  // Restores bytes only: the dependency file rows are rolled back with the transaction
  async restoreDependencyFiles({
    workspaceId,
    applicationUniversalIdentifier,
    packageJsonContent,
    yarnLockContent,
  }: ApplicationStorageScope & ApplicationDependencyFiles): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    for (const [fileName, sourceFile] of [
      [DEPENDENCY_FILE_NAMES.packageJson, packageJsonContent],
      [DEPENDENCY_FILE_NAMES.yarnLock, yarnLockContent],
    ] as const) {
      const storagePath = join(
        workspaceId,
        applicationUniversalIdentifier,
        FileFolder.Dependencies,
        fileName,
      );

      try {
        await driver.writeFile({
          filePath: storagePath,
          sourceFile,
          mimeType: undefined,
        });
      } catch (error) {
        this.logger.error(
          `Failed to restore "${storagePath}", re-upload it manually`,
          error,
        );
      }
    }
  }
}
