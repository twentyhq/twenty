import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';
import { FileFolder } from 'twenty-shared/types';
import { PackageJson } from 'type-fest';

import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { LogicFunctionLayerEntity } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.entity';
import { CreateLogicFunctionLayerInput } from 'src/engine/metadata-modules/logic-function-layer/dtos/create-logic-function-layer.input';
import { getLastCommonLayerDependencies } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/get-last-common-layer-dependencies';
import { logicFunctionCreateHash } from 'src/engine/metadata-modules/logic-function/utils/logic-function-create-hash.utils';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@Injectable()
export class LogicFunctionLayerService {
  constructor(
    @InjectRepository(LogicFunctionLayerEntity)
    private readonly logicFunctionLayerRepository: Repository<LogicFunctionLayerEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async create(
    {
      packageJsonChecksum,
      yarnLockChecksum,
      applicationUniversalIdentifier,
    }: CreateLogicFunctionLayerInput,
    workspaceId: string,
  ) {
    const logicFunctionLayer = this.logicFunctionLayerRepository.create({
      packageJson: {}, // TODO: Delete when migration to Source files storage is done
      yarnLock: '', // TODO: Delete when migration to Source files storage is done
      packageJsonChecksum,
      yarnLockChecksum,
      workspaceId,
    } as Omit<LogicFunctionLayerEntity, 'workspace'>);

    const availablePackages = await this.getAvailablePackages({
      workspaceId,
      applicationUniversalIdentifier,
    });

    const savedLayer = await this.logicFunctionLayerRepository.save({
      ...logicFunctionLayer,
      availablePackages,
    });

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'logicFunctionLayerMaps',
    ]);

    return savedLayer;
  }

  async update(
    id: string,
    data: QueryDeepPartialEntity<Omit<LogicFunctionLayerEntity, 'workspace'>>,
    applicationUniversalIdentifier: string,
    workspaceId: string,
  ) {
    const availablePackages = await this.getAvailablePackages({
      workspaceId,
      applicationUniversalIdentifier,
    });

    const result = await this.logicFunctionLayerRepository.update(id, {
      ...data,
      availablePackages,
    });

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'logicFunctionLayerMaps',
    ]);

    return result;
  }

  async createCommonLayer({
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
      resourcePath: 'package.json',
      settings: { isTemporaryFile: false, toDelete: false },
    });

    await this.fileStorageService.writeFile_v2({
      sourceFile: yarnLock,
      mimeType: undefined,
      fileFolder: FileFolder.Source,
      applicationUniversalIdentifier,
      workspaceId,
      resourcePath: 'yarn.lock',
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

    return this.create(
      { packageJsonChecksum, yarnLockChecksum, applicationUniversalIdentifier },
      workspaceId,
    );
  }

  private async getAvailablePackages({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }) {
    const packageJson = JSON.parse(
      (
        await streamToBuffer(
          await this.fileStorageService.readFile_v2({
            workspaceId,
            applicationUniversalIdentifier,
            fileFolder: FileFolder.Source,
            resourcePath: 'package.json',
          }),
        )
      ).toString('utf-8'),
    ) as PackageJson;

    const yarnLock = (
      await streamToBuffer(
        await this.fileStorageService.readFile_v2({
          workspaceId,
          applicationUniversalIdentifier,
          fileFolder: FileFolder.Source,
          resourcePath: 'yarn.lock',
        }),
      )
    ).toString('utf-8');

    const packageVersionRegex =
      /^"(@?[^@]+(?:\/[^@]+)?)@.*?":\n\s+version:\s*(.+)$/gm;

    const versions: Record<string, string> = {};

    let match: RegExpExecArray | null;

    while ((match = packageVersionRegex.exec(yarnLock)) !== null) {
      const packageName = match[1];
      const version = match[2];

      if (packageJson.dependencies?.[packageName]) {
        versions[packageName] = version;
      }
    }

    return versions;
  }
}
