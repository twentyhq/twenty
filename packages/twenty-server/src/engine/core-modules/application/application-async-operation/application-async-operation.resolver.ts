import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationAsyncOperationService } from 'src/engine/core-modules/application/application-async-operation/application-async-operation.service';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { UninstallApplicationInput } from 'src/engine/core-modules/application/application-manifest/dtos/uninstall-application.input';
import { ApplicationRegistrationExceptionFilter } from 'src/engine/core-modules/application/application-registration/application-registration-exception-filter';
import { ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseFilters(
  ApplicationExceptionFilter,
  ApplicationRegistrationExceptionFilter,
  AuthGraphqlApiExceptionFilter,
)
@UseGuards(WorkspaceAuthGuard)
export class ApplicationAsyncOperationResolver {
  constructor(
    private readonly applicationAsyncOperationService: ApplicationAsyncOperationService,
  ) {}

  @Mutation(() => ApplicationDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  async installApplicationAsync(
    @Args('universalIdentifier') universalIdentifier: string,
    @Args('version', { type: () => String, nullable: true })
    version: string | undefined,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.applicationAsyncOperationService.enqueueInstall({
      universalIdentifier,
      version,
      workspaceId,
    });
  }

  @Mutation(() => ApplicationDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  async upgradeApplicationAsync(
    @Args('appRegistrationId') appRegistrationId: string,
    @Args('targetVersion') targetVersion: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.applicationAsyncOperationService.enqueueUpgrade({
      appRegistrationId,
      targetVersion,
      workspaceId,
    });
  }

  @Mutation(() => ApplicationDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  async uninstallApplicationAsync(
    @Args() { universalIdentifier }: UninstallApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.applicationAsyncOperationService.enqueueUninstall({
      universalIdentifier,
      workspaceId,
    });
  }
}
