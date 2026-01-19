import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

@Command({
  name: 'upgrade:1-16:identify-role-metadata',
  description: 'Identify standard role metadata',
})
export class IdentifyRoleMetadataCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    protected readonly applicationService: ApplicationService,
    protected readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running identify standard role metadata for workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    await this.identifyStandardRole({
      workspaceId,
      twentyStandardApplicationId: twentyStandardFlatApplication.id,
      dryRun: options.dryRun ?? false,
    });

    await this.identifyCustomRoles({
      workspaceId,
      workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      dryRun: options.dryRun ?? false,
    });

    const relatedMetadataNames = getMetadataRelatedMetadataNames('role');
    const relatedCacheKeysToInvalidate = relatedMetadataNames.map(
      getMetadataFlatEntityMapsKey,
    );

    this.logger.log(
      `Invalidating caches: flatRoleMaps ${relatedCacheKeysToInvalidate.join(' ')}`,
    );
    if (!options.dryRun) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatRoleMaps',
        ...relatedCacheKeysToInvalidate,
      ]);
    }
  }

  private async identifyStandardRole({
    workspaceId,
    twentyStandardApplicationId,
    dryRun,
  }: {
    workspaceId: string;
    twentyStandardApplicationId: string;
    dryRun: boolean;
  }): Promise<void> {
    const adminRole = await this.roleRepository.findOne({
      select: {
        id: true,
        label: true,
        universalIdentifier: true,
        applicationId: true,
      },
      where: {
        workspaceId,
        label: 'Admin',
        isEditable: false,
      },
    });

    if (!isDefined(adminRole)) {
      this.logger.warn(
        `Standard role "Admin" not found for workspace ${workspaceId}, skipping standard role identification`,
      );

      return;
    }

    if (isDefined(adminRole.applicationId)) {
      this.logger.warn(
        `Standard role "Admin" already has applicationId set, skipping`,
      );

      return;
    }

    this.logger.log(
      `  - Standard role "Admin" (id=${adminRole.id}) -> universalIdentifier=${STANDARD_ROLE.admin.universalIdentifier}`,
    );

    if (!dryRun) {
      await this.roleRepository.save({
        id: adminRole.id,
        universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
        applicationId: twentyStandardApplicationId,
      });
    }
  }

  private async identifyCustomRoles({
    workspaceId,
    workspaceCustomApplicationId,
    dryRun,
  }: {
    workspaceId: string;
    workspaceCustomApplicationId: string;
    dryRun: boolean;
  }): Promise<void> {
    const remainingCustomRoles = await this.roleRepository.find({
      select: {
        id: true,
        universalIdentifier: true,
        applicationId: true,
      },
      where: {
        workspaceId,
        applicationId: IsNull(),
      },
    });

    const customUpdates = remainingCustomRoles.map((roleEntity) => ({
      id: roleEntity.id,
      universalIdentifier: roleEntity.universalIdentifier ?? v4(),
      applicationId: workspaceCustomApplicationId,
    }));

    this.logger.log(
      `Found ${customUpdates.length} custom role(s) to update for workspace ${workspaceId}`,
    );

    if (!dryRun) {
      await this.roleRepository.save(customUpdates);
    }
  }
}
