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
import { getDefaultApplicationPackageFields } from 'src/engine/core-modules/application/application-package/utils/get-default-application-package-fields.util';
import { parseAvailablePackagesFromPackageJsonAndYarnLock } from 'src/engine/core-modules/application/application-package/utils/parse-available-packages-from-package-json-and-yarn-lock.util';
import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { ALL_FLAT_ENTITY_MAPS_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-maps-properties.constant';
import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { logicFunctionCreateHash } from 'src/engine/metadata-modules/logic-function/utils/logic-function-create-hash.utils';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
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
    @InjectRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: Repository<LogicFunctionEntity>,
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    @InjectRepository(FrontComponentEntity)
    private readonly frontComponentRepository: Repository<FrontComponentEntity>,
    @InjectRepository(CommandMenuItemEntity)
    private readonly commandMenuItemRepository: Repository<CommandMenuItemEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(ApplicationVariableEntity)
    private readonly applicationVariableRepository: Repository<ApplicationVariableEntity>,
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
          select: ['id', 'workspaceCustomApplicationId'],
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
        `Could not find workspace Standard applicationId in cache ${workspaceId}`,
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
      relations: ['applicationRegistration'],
    });
  }

  async findManyInstalledFlatApplications(
    workspaceId: string,
  ): Promise<FlatApplication[]> {
    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

    return Object.values(flatApplicationMaps.byId).filter(
      (flatApplication): flatApplication is FlatApplication =>
        isDefined(flatApplication) && !isDefined(flatApplication.deletedAt),
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

    const application = await this.applicationRepository.findOne({
      where,
      relations: ['packageJsonFile', 'yarnLockFile', 'applicationRegistration'],
    });

    if (!isDefined(application)) {
      return null;
    }

    const [
      logicFunctions,
      agents,
      frontComponents,
      commandMenuItems,
      objects,
      applicationVariables,
    ] = await Promise.all([
      this.logicFunctionRepository.find({
        where: { applicationId: application.id, workspaceId },
      }),
      this.agentRepository.find({
        where: { applicationId: application.id, workspaceId },
      }),
      this.frontComponentRepository.find({
        where: { applicationId: application.id, workspaceId },
      }),
      this.commandMenuItemRepository.find({
        where: { applicationId: application.id, workspaceId },
      }),
      this.objectMetadataRepository.find({
        where: { applicationId: application.id, workspaceId },
      }),
      this.applicationVariableRepository.find({
        where: { applicationId: application.id, workspaceId },
      }),
    ]);

    application.logicFunctions = logicFunctions;
    application.agents = agents;
    application.frontComponents = frontComponents;
    application.commandMenuItems = commandMenuItems;
    application.objects = objects;
    application.applicationVariables = applicationVariables;

    return application;
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

    const application = await this.applicationRepository.findOne({
      where: {
        id: twentyStandardFlatApplication.id,
        workspaceId: workspace.id,
      },
    });

    if (!isDefined(application)) {
      throw new ApplicationException(
        `Standard application not found for workspace ${workspace.id}`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    return { application, workspace };
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
    }: {
      workspaceId: string;
      applicationId: string;
    },
    queryRunner?: QueryRunner,
  ) {
    const defaultPackageFields = await getDefaultApplicationPackageFields();

    const workspaceCustomApplication = await this.create(
      {
        description: null,
        name: 'Custom',
        sourcePath: 'workspace-custom',
        version: '1.0.1',
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
    const application = this.applicationRepository.create(data);

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
    data: Parameters<typeof this.applicationRepository.update>[1] & {
      workspaceId: string;
    },
  ): Promise<ApplicationEntity> {
    await this.applicationRepository.update({ id }, data);

    await this.workspaceCacheService.invalidateAndRecompute(data.workspaceId, [
      'flatApplicationMaps',
    ]);

    const updatedApplication = await this.findById(id);

    if (!isDefined(updatedApplication)) {
      throw new ApplicationException(
        `Application with id ${id} not found after update`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    return updatedApplication;
  }

  async delete(universalIdentifier: string, workspaceId: string) {
    const application = await this.findByUniversalIdentifier({
      universalIdentifier,
      workspaceId,
    });

    if (!isDefined(application)) {
      throw new ApplicationException(
        `Application with universalIdentifier ${universalIdentifier} not found`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
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
