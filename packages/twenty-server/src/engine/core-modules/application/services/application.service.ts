import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner, type Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { getDefaultApplicationPackageFields } from 'src/engine/core-modules/application-layer/utils/get-default-application-package-fields.util';
import { parseAvailablePackagesFromPackageJsonAndYarnLock } from 'src/engine/core-modules/application-layer/utils/parse-available-packages-from-package-json-and-yarn-lock.util';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ALL_FLAT_ENTITY_MAPS_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-maps-properties.constant';
import { logicFunctionCreateHash } from 'src/engine/metadata-modules/logic-function/utils/logic-function-create-hash.utils';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly fileStorageService: FileStorageService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async findApplicationRoleId(
    applicationId: string,
    workspaceId: string,
  ): Promise<string> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId, workspaceId },
    });

    if (!isDefined(application) || !isDefined(application.defaultRoleId)) {
      throw new ApplicationException(
        `Could not find application ${applicationId}`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    return application.defaultRoleId;
  }

  async findWorkspaceTwentyStandardAndCustomApplicationOrThrow({
    workspace: workspaceInput,
    workspaceId,
  }:
    | {
        workspaceId: string;
        workspace?: never;
      }
    | {
        workspace: WorkspaceEntity;
        workspaceId?: never;
      }) {
    const workspace = isDefined(workspaceInput)
      ? workspaceInput
      : await this.workspaceRepository.findOne({
          where: {
            id: workspaceId,
          },
          withDeleted: true,
        });

    if (!isDefined(workspace)) {
      throw new ApplicationException(
        `Could not find workspace ${workspaceId}`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspace.id, [
        'flatApplicationMaps',
      ]);

    const twentyStandardApplicationId =
      flatApplicationMaps.idByUniversalIdentifier[
        TWENTY_STANDARD_APPLICATION.universalIdentifier
      ];

    if (!isDefined(twentyStandardApplicationId)) {
      throw new ApplicationException(
        `Could not find workspace twenty standard applicationId in cache ${workspaceId}`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    const twentyStandardFlatApplication =
      flatApplicationMaps.byId[twentyStandardApplicationId];
    const workspaceCustomFlatApplication =
      flatApplicationMaps.byId[workspace.workspaceCustomApplicationId];

    if (
      !isDefined(twentyStandardFlatApplication) ||
      !isDefined(workspaceCustomFlatApplication)
    ) {
      throw new ApplicationException(
        `Could not find workspace custom and standard applications ${workspace.id}`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    return {
      twentyStandardFlatApplication,
      workspaceCustomFlatApplication,
    };
  }

  async findManyApplications(
    workspaceId: string,
  ): Promise<ApplicationEntity[]> {
    return this.applicationRepository.find({
      where: { workspaceId },
      relations: [
        'logicFunctions',
        'agents',
        'objects',
        'applicationVariables',
        'packageJsonFile',
        'yarnLockFile',
      ],
    });
  }

  async checkApplicationExist({
    id,
    universalIdentifier,
    workspaceId,
  }: {
    id?: string;
    universalIdentifier?: string;
    workspaceId: string;
  }) {
    return isDefined(
      await this.findOneApplication({ id, universalIdentifier, workspaceId }),
    );
  }

  async findOneApplication({
    id,
    universalIdentifier,
    workspaceId,
  }: {
    id?: string;
    universalIdentifier?: string;
    workspaceId: string;
  }): Promise<ApplicationEntity | null> {
    if (!isDefined(id) && !isDefined(universalIdentifier)) {
      throw new ApplicationException(
        `Either id or universalIdentifier must be provided to find application.`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    const where = {
      workspaceId,
      ...(isDefined(id) ? { id } : { universalIdentifier }),
    };

    return await this.applicationRepository.findOne({
      where,
      relations: [
        'logicFunctions',
        'agents',
        'objects',
        'applicationVariables',
        'packageJsonFile',
        'yarnLockFile',
      ],
    });
  }

  async findOneApplicationOrThrow({
    id,
    universalIdentifier,
    workspaceId,
  }: {
    id?: string;
    universalIdentifier?: string;
    workspaceId: string;
  }): Promise<ApplicationEntity> {
    const application = await this.findOneApplication({
      id,
      universalIdentifier,
      workspaceId,
    });

    if (!isDefined(application)) {
      throw new ApplicationException(
        `Application with id ${id} or universalIdentifier ${universalIdentifier} not found`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    return application;
  }

  async findById(id: string): Promise<ApplicationEntity | null> {
    return this.applicationRepository.findOne({
      where: { id },
    });
  }

  async findByUniversalIdentifier({
    universalIdentifier,
    workspaceId,
  }: {
    universalIdentifier: string;
    workspaceId: string;
  }) {
    return this.applicationRepository.findOne({
      where: {
        universalIdentifier,
        workspaceId,
      },
    });
  }

  async createOneApplication(
    data: Partial<ApplicationEntity> & { workspaceId: string },
  ): Promise<ApplicationEntity> {
    return this.create(data);
  }

  async findTwentyStandardApplicationOrThrow(workspaceId: string): Promise<{
    application: ApplicationEntity;
    workspace: WorkspaceEntity;
  }> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!isDefined(workspace)) {
      throw new ApplicationException(
        `Could not find workspace ${workspaceId}`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    const { twentyStandardFlatApplication } =
      await this.findWorkspaceTwentyStandardAndCustomApplicationOrThrow({
        workspace,
      });

    return {
      application: twentyStandardFlatApplication as ApplicationEntity,
      workspace,
    };
  }

  async createTwentyStandardApplication(
    {
      workspaceId,
      skipCacheInvalidation = false,
    }: {
      workspaceId: string;
      skipCacheInvalidation?: boolean;
    },
    queryRunner?: QueryRunner,
  ) {
    const defaultPackageFields = await getDefaultApplicationPackageFields();

    const twentyStandardApplication = await this.create(
      {
        ...TWENTY_STANDARD_APPLICATION,
        logicFunctionLayerId: null,
        workspaceId,
        canBeUninstalled: false,
        packageJsonChecksum: defaultPackageFields.packageJsonChecksum,
        packageJsonFileId: null,
        yarnLockChecksum: defaultPackageFields.yarnLockChecksum,
        yarnLockFileId: null,
        availablePackages: defaultPackageFields.availablePackages,
      },
      queryRunner,
    );

    await this.uploadDefaultPackageFilesAndSetFileIds(
      twentyStandardApplication,
      queryRunner,
    );

    if (!skipCacheInvalidation) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);
    }

    return twentyStandardApplication;
  }

  async createWorkspaceCustomApplication(
    {
      workspaceId,
      applicationId,
      workspaceDisplayName,
    }: {
      workspaceId: string;
      applicationId: string;
      workspaceDisplayName?: string;
    },
    queryRunner?: QueryRunner,
  ) {
    const defaultPackageFields = await getDefaultApplicationPackageFields();

    const workspaceCustomApplication = await this.create(
      {
        description: 'Workspace custom application',
        name: `${isDefined(workspaceDisplayName) ? workspaceDisplayName : 'Workspace'}'s custom application`,
        sourcePath: 'workspace-custom',
        version: '1.0.0',
        universalIdentifier: applicationId,
        workspaceId,
        id: applicationId,
        logicFunctionLayerId: null,
        canBeUninstalled: false,
        packageJsonChecksum: defaultPackageFields.packageJsonChecksum,
        packageJsonFileId: null,
        yarnLockChecksum: defaultPackageFields.yarnLockChecksum,
        yarnLockFileId: null,
        availablePackages: defaultPackageFields.availablePackages,
      },
      queryRunner,
    );

    await this.uploadDefaultPackageFilesAndSetFileIds(
      workspaceCustomApplication,
      queryRunner,
    );

    return workspaceCustomApplication;
  }

  async uploadDefaultPackageFilesAndSetFileIds(
    application: Pick<
      ApplicationEntity,
      'id' | 'universalIdentifier' | 'workspaceId'
    >,
    queryRunner?: QueryRunner,
  ): Promise<void> {
    const defaultPackageFields = await getDefaultApplicationPackageFields();

    const packageJsonChecksum = logicFunctionCreateHash(
      JSON.stringify(JSON.parse(defaultPackageFields.packageJsonContent)),
    );
    const yarnLockChecksum = logicFunctionCreateHash(
      defaultPackageFields.yarnLockContent,
    );
    const availablePackages = parseAvailablePackagesFromPackageJsonAndYarnLock(
      defaultPackageFields.packageJsonContent,
      defaultPackageFields.yarnLockContent,
    );

    const packageJsonFile = await this.fileStorageService.writeFile({
      sourceFile: defaultPackageFields.packageJsonContent,
      mimeType: undefined,
      fileFolder: FileFolder.Dependencies,
      applicationUniversalIdentifier: application.universalIdentifier,
      workspaceId: application.workspaceId,
      resourcePath: 'package.json',
      settings: { isTemporaryFile: false, toDelete: false },
      queryRunner,
    });

    const yarnLockFile = await this.fileStorageService.writeFile({
      sourceFile: defaultPackageFields.yarnLockContent,
      mimeType: undefined,
      fileFolder: FileFolder.Dependencies,
      applicationUniversalIdentifier: application.universalIdentifier,
      workspaceId: application.workspaceId,
      resourcePath: 'yarn.lock',
      settings: { isTemporaryFile: false, toDelete: false },
      queryRunner,
    });

    if (queryRunner) {
      await queryRunner.manager.update(
        ApplicationEntity,
        { id: application.id },
        {
          packageJsonFileId: packageJsonFile.id,
          yarnLockFileId: yarnLockFile.id,
          packageJsonChecksum,
          yarnLockChecksum,
          availablePackages,
        },
      );
    } else {
      await this.update(application.id, {
        packageJsonFileId: packageJsonFile.id,
        yarnLockFileId: yarnLockFile.id,
        packageJsonChecksum,
        yarnLockChecksum,
        availablePackages,
        workspaceId: application.workspaceId,
      });
    }
  }

  async create(
    data: Partial<ApplicationEntity> & { workspaceId: string },
    queryRunner?: QueryRunner,
  ): Promise<ApplicationEntity> {
    const application = this.applicationRepository.create({
      ...data,
      sourceType: 'local',
    });

    if (queryRunner) {
      return queryRunner.manager.save(ApplicationEntity, application);
    }

    const savedApplication = await this.applicationRepository.save(application);

    await this.workspaceCacheService.invalidateAndRecompute(data.workspaceId, [
      'flatApplicationMaps',
    ]);

    return savedApplication;
  }

  async update(
    id: string,
    data: Parameters<typeof this.applicationRepository.update>[1],
  ): Promise<ApplicationEntity> {
    await this.applicationRepository.update({ id }, data);

    await this.workspaceCacheService.invalidateAndRecompute(
      data.workspaceId as string,
      ['flatApplicationMaps'],
    );

    const updatedApplication = await this.findById(id);

    if (!updatedApplication) {
      throw new Error(`Failed to update application with id ${id}`);
    }

    return updatedApplication;
  }

  async delete(universalIdentifier: string, workspaceId: string) {
    const application = await this.findByUniversalIdentifier({
      universalIdentifier,
      workspaceId,
    });

    if (!isDefined(application)) {
      throw new Error(`Application does not exist`);
    }

    await this.fileStorageService.deleteApplicationFiles({
      workspaceId,
      applicationUniversalIdentifier: universalIdentifier,
    });

    await this.applicationRepository.delete({
      universalIdentifier,
      workspaceId,
    });

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatApplicationMaps',
    ]);

    await this.workspaceCacheService.invalidateAndRecompute(
      workspaceId,
      ALL_FLAT_ENTITY_MAPS_PROPERTIES,
    );
  }
}
