import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';
import {
  ApplicationUpgradeRoleGrantDTO,
  fromRoleManifestGrantToApplicationUpgradeRoleGrantDTO,
} from 'src/engine/core-modules/application/application-upgrade/dtos/application-upgrade-role-grant.dto';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';

@MetadataResolver()
@UseFilters(ApplicationExceptionFilter, AuthGraphqlApiExceptionFilter)
@UseGuards(UserAuthGuard, WorkspaceAuthGuard, NoPermissionGuard)
export class ApplicationUpgradeResolver {
  constructor(
    private readonly applicationUpgradeService: ApplicationUpgradeService,
  ) {}

  @Query(() => [ApplicationUpgradeRoleGrantDTO])
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  async applicationUpgradeRoleGrants(
    @Args('applicationId', { type: () => UUIDScalarType })
    applicationId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApplicationUpgradeRoleGrantDTO[]> {
    const grants =
      await this.applicationUpgradeService.getRoleGrantsAddedByLatestVersion({
        applicationId,
        workspaceId: workspace.id,
      });

    return grants.map(fromRoleManifestGrantToApplicationUpgradeRoleGrantDTO);
  }

  @Mutation(() => Boolean)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  async upgradeApplication(
    @Args('appRegistrationId') appRegistrationId: string,
    @Args('targetVersion') targetVersion: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('hasUserApprovedRoleGrants', {
      type: () => Boolean,
      nullable: true,
    })
    hasUserApprovedRoleGrants?: boolean,
  ): Promise<boolean> {
    return this.applicationUpgradeService.upgradeApplication({
      appRegistrationId,
      targetVersion,
      workspaceId: workspace.id,
      hasUserApprovedRoleGrants: hasUserApprovedRoleGrants ?? false,
    });
  }
}
