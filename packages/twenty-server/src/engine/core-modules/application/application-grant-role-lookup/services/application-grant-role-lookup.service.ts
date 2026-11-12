import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { resolveApplicationGrantRoleId } from 'src/engine/core-modules/application/application-grant-role/utils/resolve-application-grant-role-id.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
} from 'src/engine/core-modules/workspace/workspace.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ApplicationGrantRoleLookupService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async findWorkspaceCustomApplicationIdOrThrow(
    workspaceId: string,
  ): Promise<string> {
    const workspace =
      (await this.coreEntityCacheService.get('workspaceEntity', workspaceId)) ??
      (await this.findSoftDeletedWorkspace(workspaceId));

    if (!isDefined(workspace)) {
      throw new WorkspaceException(
        `Workspace ${workspaceId} not found`,
        WorkspaceExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    return workspace.workspaceCustomApplicationId;
  }

  private async findSoftDeletedWorkspace(
    workspaceId: string,
  ): Promise<Pick<WorkspaceEntity, 'workspaceCustomApplicationId'> | null> {
    return this.workspaceRepository.findOne({
      where: { id: workspaceId },
      select: { id: true, workspaceCustomApplicationId: true },
      withDeleted: true,
    });
  }

  async findGrantRoleId({
    workspaceId,
    flatApplication,
  }: {
    workspaceId: string;
    flatApplication: Pick<
      FlatApplication,
      'id' | 'defaultRoleId' | 'sourceType'
    >;
  }): Promise<string | undefined> {
    const workspaceCustomApplicationId =
      await this.findWorkspaceCustomApplicationIdOrThrow(workspaceId);
    const { flatRoleTargetByApplicationIdMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatRoleTargetByApplicationIdMaps',
      ]);

    return resolveApplicationGrantRoleId({
      flatApplication,
      workspaceId,
      workspaceCustomApplicationId,
      flatRoleTargetByApplicationIdMaps,
    });
  }

  async findApplicationAndGrantRoleIdOrThrow({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string | null | undefined;
  }): Promise<{
    flatApplication: FlatApplication;
    grantRoleId: string | undefined;
  }> {
    const workspaceCustomApplicationId =
      await this.findWorkspaceCustomApplicationIdOrThrow(workspaceId);
    const { flatApplicationMaps, flatRoleTargetByApplicationIdMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
        'flatRoleTargetByApplicationIdMaps',
      ]);
    const resolvedApplicationId = applicationId ?? workspaceCustomApplicationId;
    const flatApplication = flatApplicationMaps.byId[resolvedApplicationId];

    if (!isDefined(flatApplication)) {
      throw new ApplicationException(
        `Application ${resolvedApplicationId} not found in workspace ${workspaceId}`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    return {
      flatApplication,
      grantRoleId: resolveApplicationGrantRoleId({
        flatApplication,
        workspaceId,
        workspaceCustomApplicationId,
        flatRoleTargetByApplicationIdMaps,
      }),
    };
  }
}
