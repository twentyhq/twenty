import { Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export type FunctionBuildParams = {
  flatLogicFunction: FlatLogicFunction;
  applicationUniversalIdentifier: string;
};

@Injectable()
export class LogicFunctionBuildService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  async hasLayerDependencies({
    flatApplication,
    applicationUniversalIdentifier,
  }: {
    flatApplication: FlatApplication;
    applicationUniversalIdentifier: string;
  }): Promise<boolean> {
    const packageJsonExists = await this.fileStorageService.checkFileExists_v2({
      workspaceId: flatApplication.workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.Dependencies,
      resourcePath: 'package.json',
    });
    const yarnLockExists = await this.fileStorageService.checkFileExists_v2({
      workspaceId: flatApplication.workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.Dependencies,
      resourcePath: 'yarn.lock',
    });

    return packageJsonExists && yarnLockExists;
  }
}
