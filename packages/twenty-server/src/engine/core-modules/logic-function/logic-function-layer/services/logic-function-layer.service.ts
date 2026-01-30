import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';
import { FileFolder } from 'twenty-shared/types';

import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { LogicFunctionLayerEntity } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.entity';
import { CreateLogicFunctionLayerInput } from 'src/engine/metadata-modules/logic-function-layer/dtos/create-logic-function-layer.input';
import { getLastCommonLayerDependencies } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/get-last-common-layer-dependencies';
import { logicFunctionCreateHash } from 'src/engine/metadata-modules/logic-function/utils/logic-function-create-hash.utils';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';

@Injectable()
export class LogicFunctionLayerService {
  constructor(
    @InjectRepository(LogicFunctionLayerEntity)
    private readonly logicFunctionLayerRepository: Repository<LogicFunctionLayerEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async create(
    { packageJsonChecksum, yarnLockChecksum }: CreateLogicFunctionLayerInput,
    workspaceId: string,
  ) {
    const logicFunctionLayer = this.logicFunctionLayerRepository.create({
      packageJson: {}, // TODO: Delete when migration to Source files storage is done
      yarnLock: '', // TODO: Delete when migration to Source files storage is done
      packageJsonChecksum,
      yarnLockChecksum,
      workspaceId,
    });

    const savedLayer =
      await this.logicFunctionLayerRepository.save(logicFunctionLayer);

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'logicFunctionLayerMaps',
    ]);

    return savedLayer;
  }

  async update(
    id: string,
    data: QueryDeepPartialEntity<LogicFunctionLayerEntity>,
    workspaceId: string,
  ) {
    const result = await this.logicFunctionLayerRepository.update(id, data);

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'logicFunctionLayerMaps',
    ]);

    return result;
  }

  // TODO: Should be replaced by seed package.json and yarn.lock files in Source folder for the Custom Workspace application
  async createCommonLayerIfNotExist({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }) {
    const { packageJson, yarnLock } = await getLastCommonLayerDependencies();

    await this.fileStorageService.writeFile_v2({
      sourceFile: packageJson,
      mimeType: undefined,
      fileFolder: FileFolder.Source,
      applicationUniversalIdentifier,
      workspaceId,
      resourcePath: '',
      settings: { isTemporaryFile: false, toDelete: false },
    });

    await this.fileStorageService.writeFile_v2({
      sourceFile: yarnLock,
      mimeType: undefined,
      fileFolder: FileFolder.Source,
      applicationUniversalIdentifier,
      workspaceId,
      resourcePath: '',
      settings: { isTemporaryFile: false, toDelete: false },
    });

    const packageJsonChecksum = logicFunctionCreateHash(
      JSON.stringify(packageJson),
    );

    const yarnLockChecksum = logicFunctionCreateHash(yarnLock);

    const commonLayer = await this.logicFunctionLayerRepository.findOne({
      where: {
        yarnLockChecksum,
        packageJsonChecksum,
        workspaceId,
      },
    });

    if (isDefined(commonLayer)) {
      return commonLayer;
    }

    return this.create({ packageJsonChecksum, yarnLockChecksum }, workspaceId);
  }
}
