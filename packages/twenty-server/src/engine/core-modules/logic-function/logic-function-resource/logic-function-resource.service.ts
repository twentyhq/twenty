import { Injectable } from '@nestjs/common';

import crypto from 'crypto';
import { join } from 'path';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import {
  getLogicFunctionSeedProjectFiles,
  LogicFunctionSeedProjectFile,
} from 'src/engine/core-modules/logic-function/logic-function-resource/utils/get-logic-function-seed-project-files.util';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

type Identifier = {
  workspaceId: string;
  applicationUniversalIdentifier: string;
};

type SeedSourceFilesParams = Identifier & {
  sourceHandlerPath: string;
  builtHandlerPath: string;
};

type SeedSourceFilesResult = {
  handlerName: string;
  checksum: string;
};

type UpdateSourceFilesParams = Omit<
  SeedSourceFilesParams,
  'builtHandlerPath'
> & {
  sourceHandlerCode: string;
};

type GetSourceCodeParams = Identifier & {
  sourceHandlerPath: string;
};

type GetBuiltCodeParams = Identifier & {
  builtHandlerPath: string;
};

type CopySourceParams = Identifier & {
  fromSourceHandlerPath: string;
  toSourceHandlerPath: string;
  fromBuiltHandlerPath: string;
  toBuiltHandlerPath: string;
};

@Injectable()
export class LogicFunctionResourceService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  async seedSourceFiles({
    workspaceId,
    applicationUniversalIdentifier,
    sourceHandlerPath,
    builtHandlerPath,
  }: SeedSourceFilesParams): Promise<SeedSourceFilesResult> {
    const seedProjectFiles = await getLogicFunctionSeedProjectFiles();

    const sourceFiles = seedProjectFiles.filter(
      (file: LogicFunctionSeedProjectFile) => file.name.endsWith('index.ts'),
    );
    const builtFiles = seedProjectFiles.filter(
      (file: LogicFunctionSeedProjectFile) => file.name.endsWith('.mjs'),
    );

    if (sourceFiles.length !== 1 || builtFiles.length !== 1) {
      throw new LogicFunctionException(
        'Logic function seed project should have one index.ts file and one index.mjs file',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_INVALID_SEED_PROJECT,
      );
    }

    const sourceFile = sourceFiles[0];
    const builtFile = builtFiles[0];

    await this.fileStorageService.writeFile({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.Source,
      resourcePath: sourceHandlerPath,
      sourceFile: sourceFile.content,
      mimeType: 'application/typescript',
      settings: {
        isTemporaryFile: false,
        toDelete: false,
      },
    });

    await this.fileStorageService.writeFile({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.BuiltLogicFunction,
      resourcePath: builtHandlerPath,
      sourceFile: builtFile.content,
      mimeType: 'application/javascript',
      settings: {
        isTemporaryFile: false,
        toDelete: false,
      },
    });

    const checksum = crypto
      .createHash('md5')
      .update(builtFile.content)
      .digest('hex');

    return {
      handlerName: 'main',
      checksum,
    };
  }

  async uploadSourceFile({
    sourceHandlerPath,
    workspaceId,
    applicationUniversalIdentifier,
    sourceHandlerCode,
  }: UpdateSourceFilesParams): Promise<void> {
    await this.fileStorageService.writeFile({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.Source,
      resourcePath: sourceHandlerPath,
      sourceFile: sourceHandlerCode,
      settings: { isTemporaryFile: false, toDelete: false },
      mimeType: 'application/typescript',
    });
  }

  async uploadBuiltFile({
    workspaceId,
    applicationUniversalIdentifier,
    builtHandlerPath,
    builtCode,
  }: Identifier & {
    builtHandlerPath: string;
    builtCode: string;
  }): Promise<void> {
    await this.fileStorageService.writeFile({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.BuiltLogicFunction,
      resourcePath: builtHandlerPath,
      sourceFile: builtCode,
      mimeType: 'application/javascript',
      settings: {
        isTemporaryFile: false,
        toDelete: false,
      },
    });
  }

  async getSourceFile({
    sourceHandlerPath,
    workspaceId,
    applicationUniversalIdentifier,
  }: GetSourceCodeParams): Promise<string | null> {
    try {
      return (
        await streamToBuffer(
          await this.fileStorageService.readFile({
            workspaceId,
            applicationUniversalIdentifier,
            fileFolder: FileFolder.Source,
            resourcePath: sourceHandlerPath,
          }),
        )
      ).toString('utf-8');
    } catch (error) {
      if (
        isDefined(error) &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === FileStorageExceptionCode.FILE_NOT_FOUND
      ) {
        return null;
      }
      throw error;
    }
  }

  async copyResources({
    fromSourceHandlerPath,
    toSourceHandlerPath,
    fromBuiltHandlerPath,
    toBuiltHandlerPath,
    workspaceId,
    applicationUniversalIdentifier,
  }: CopySourceParams): Promise<void> {
    await this.fileStorageService.copy({
      from: {
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: fromSourceHandlerPath,
      },
      to: {
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: toSourceHandlerPath,
      },
    });

    await this.fileStorageService.copy({
      from: {
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.BuiltLogicFunction,
        resourcePath: fromBuiltHandlerPath,
      },
      to: {
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.BuiltLogicFunction,
        resourcePath: toBuiltHandlerPath,
      },
    });
  }

  async copyDependenciesInMemory({
    applicationUniversalIdentifier,
    workspaceId,
    inMemoryFolderPath,
  }: {
    applicationUniversalIdentifier: string;
    workspaceId: string;
    inMemoryFolderPath: string;
  }) {
    await Promise.all([
      this.fileStorageService.downloadFile({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Dependencies,
        resourcePath: 'package.json',
        localPath: join(inMemoryFolderPath, 'package.json'),
      }),
      this.fileStorageService.downloadFile({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Dependencies,
        resourcePath: 'yarn.lock',
        localPath: join(inMemoryFolderPath, 'yarn.lock'),
      }),
    ]);
  }

  async getBuiltCode({
    builtHandlerPath,
    workspaceId,
    applicationUniversalIdentifier,
  }: GetBuiltCodeParams): Promise<string> {
    return (
      await streamToBuffer(
        await this.fileStorageService.readFile({
          workspaceId: workspaceId,
          applicationUniversalIdentifier,
          fileFolder: FileFolder.BuiltLogicFunction,
          resourcePath: builtHandlerPath,
        }),
      )
    ).toString('utf-8');
  }

  async copyBuiltCodeInMemory({
    builtHandlerPath,
    workspaceId,
    applicationUniversalIdentifier,
    inMemoryDestinationPath,
  }: GetBuiltCodeParams & {
    inMemoryDestinationPath: string;
  }): Promise<string> {
    const localPath = join(inMemoryDestinationPath, builtHandlerPath);

    await this.fileStorageService.downloadFile({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.BuiltLogicFunction,
      resourcePath: builtHandlerPath,
      localPath,
    });

    return localPath;
  }
}
