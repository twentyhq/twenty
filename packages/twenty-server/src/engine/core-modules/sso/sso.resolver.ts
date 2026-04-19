/* @license Enterprise */

import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { EnterpriseFeaturesEnabledGuard } from 'src/engine/core-modules/auth/guards/enterprise-features-enabled.guard';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { DeleteSsoInput } from 'src/engine/core-modules/Sso/dtos/delete-Sso.input';
import { DeleteSsoDTO } from 'src/engine/core-modules/Sso/dtos/delete-Sso.dto';
import { EditSsoInput } from 'src/engine/core-modules/Sso/dtos/edit-Sso.input';
import { EditSsoDTO } from 'src/engine/core-modules/Sso/dtos/edit-Sso.dto';
import { FindAvailableSsoIDPDTO } from 'src/engine/core-modules/Sso/dtos/find-available-Sso-IDP.dto';
import {
  SetupOidcSsoInput,
  SetupSamlSsoInput,
} from 'src/engine/core-modules/Sso/dtos/setup-Sso.input';
import { SetupSsoDTO } from 'src/engine/core-modules/Sso/dtos/setup-Sso.dto';
import { SsoService } from 'src/engine/core-modules/Sso/services/Sso.service';
import { type SsoException } from 'src/engine/core-modules/Sso/Sso.exception';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-Api-exception.filter';

@MetadataResolver()
@UseFilters(
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
@UsePipes(ResolverValidationPipe)
@UseGuards(SettingsPermissionGuard(PermissionFlagType.SECURITY))
export class SsoResolver {
  constructor(private readonly SsoService: SsoService) {}

  @UseGuards(WorkspaceAuthGuard, EnterpriseFeaturesEnabledGuard)
  @Mutation(() => SetupSsoDTO)
  async createOidcIdentityProvider(
    @Args('input') setupSsoInput: SetupOidcSsoInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<SetupSsoDTO | SsoException> {
    return this.SsoService.createOidcIdentityProvider(
      setupSsoInput,
      workspaceId,
    );
  }

  @UseGuards(WorkspaceAuthGuard, EnterpriseFeaturesEnabledGuard)
  @Query(() => [FindAvailableSsoIDPDTO])
  async getSsoIdentityProviders(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.SsoService.getSsoIdentityProviders(workspaceId);
  }

  @UseGuards(WorkspaceAuthGuard, EnterpriseFeaturesEnabledGuard)
  @Mutation(() => SetupSsoDTO)
  async createSamlIdentityProvider(
    @Args('input') setupSsoInput: SetupSamlSsoInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<SetupSsoDTO | SsoException> {
    return this.SsoService.createSamlIdentityProvider(
      setupSsoInput,
      workspaceId,
    );
  }

  @UseGuards(WorkspaceAuthGuard, EnterpriseFeaturesEnabledGuard)
  @Mutation(() => DeleteSsoDTO)
  async deleteSsoIdentityProvider(
    @Args('input') { identityProviderId }: DeleteSsoInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.SsoService.deleteSsoIdentityProvider(
      identityProviderId,
      workspaceId,
    );
  }

  @UseGuards(WorkspaceAuthGuard, EnterpriseFeaturesEnabledGuard)
  @Mutation(() => EditSsoDTO)
  async editSsoIdentityProvider(
    @Args('input') input: EditSsoInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.SsoService.editSsoIdentityProvider(input, workspaceId);
  }
}
