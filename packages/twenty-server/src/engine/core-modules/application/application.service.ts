import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner, type Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ALL_FLAT_ENTITY_MAPS_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-maps-properties.constant';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async findWorkspaceTwentyStandardAndCustomApplicationOrThrow({
    workspace: workspaceInput,
    workspaceId,
  }:
    | {
        workspaceId: string;
        workspace?: never;
      }
    | { workspace: WorkspaceEntity; workspaceId?: never }) {
    const workspace = isDefined(workspaceInput)
      ? workspaceInput
      : await this.workspaceRepository.findOne({
          where: {
            id: workspaceId,
          },
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
        'serverlessFunctions',
        'agents',
        'objects',
        'applicationVariables',
      ],
    });
  }

  async findOneApplication(
    applicationId: string,
    workspaceId: string,
  ): Promise<ApplicationEntity> {
    const application = await this.applicationRepository.findOne({
      where: { workspaceId, id: applicationId },
      relations: [
        'serverlessFunctions',
        'agents',
        'objects',
        'applicationVariables',
      ],
    });

    if (!isDefined(application)) {
      throw new ApplicationException(
        `Application with id ${applicationId} not found`,
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
    const twentyStandardApplication = await this.create(
      {
        ...TWENTY_STANDARD_APPLICATION,
        serverlessFunctionLayerId: null,
        workspaceId,
        canBeUninstalled: false,
      },
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
      workspaceDisplayName,
    }: {
      workspaceId: string;
      workspaceDisplayName?: string;
    },
    queryRunner?: QueryRunner,
  ) {
    const applicationId = v4();
    const workspaceCustomApplication = await this.create(
      {
        description: 'Workspace custom application',
        name: `${isDefined(workspaceDisplayName) ? workspaceDisplayName : 'Workspace'}'s custom application`,
        sourcePath: 'workspace-custom',
        version: '1.0.0',
        universalIdentifier: applicationId,
        workspaceId: workspaceId,
        id: applicationId,
        serverlessFunctionLayerId: null,
        canBeUninstalled: false,
      },
      queryRunner,
    );

    return workspaceCustomApplication;
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
