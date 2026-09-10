/* @license Enterprise */

import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { EnterpriseFeaturesEnabledGuard } from 'src/engine/core-modules/auth/guards/enterprise-features-enabled.guard';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { DeleteSsoInput } from 'src/engine/core-modules/sso/dtos/delete-sso.input';
import { DeleteSsoDTO } from 'src/engine/core-modules/sso/dtos/delete-sso.dto';
import { EditSsoInput } from 'src/engine/core-modules/sso/dtos/edit-sso.input';
import { EditSsoDTO } from 'src/engine/core-modules/sso/dtos/edit-sso.dto';
import { FindAvailableSsoIdpDTO } from 'src/engine/core-modules/sso/dtos/find-available-sso-idp.dto';
import {
  SetupOidcSsoInput,
  SetupSamlSsoInput,
} from 'src/engine/core-modules/sso/dtos/setup-sso.input';
import { SetupSsoDTO } from 'src/engine/core-modules/sso/dtos/setup-sso.dto';
import { SsoService } from 'src/engine/core-modules/sso/services/sso.service';
import { type SsoException } from 'src/engine/core-modules/sso/sso.exception';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@MetadataResolver()
@UseFilters(
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
@UsePipes(ResolverValidationPipe)
@UseGuards(SettingsPermissionGuard(PermissionFlagType.SECURITY))
export class SsoResolver {
  constructor(private readonly ssoService: SsoService) {}

  @UseGuards(WorkspaceAuthGuard, EnterpriseFeaturesEnabledGuard)
  @Mutation(() => SetupSsoDTO)
  async createOIDCIdentityProvider(
    @Args('input') setupSsoInput: SetupOidcSsoInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<SetupSsoDTO | SsoException> {
    return this.ssoService.createOidcIdentityProvider(
      setupSsoInput,
      workspaceId,
    );
  }

  @UseGuards(WorkspaceAuthGuard, EnterpriseFeaturesEnabledGuard)
  @Query(() => [FindAvailableSsoIdpDTO])
  async getSSOIdentityProviders(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.ssoService.getSsoIdentityProviders(workspaceId);
  }

  @UseGuards(WorkspaceAuthGuard, EnterpriseFeaturesEnabledGuard)
  @Mutation(() => SetupSsoDTO)
  async createSAMLIdentityProvider(
    @Args('input') setupSsoInput: SetupSamlSsoInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<SetupSsoDTO | SsoException> {
    return this.ssoService.createSamlIdentityProvider(
      setupSsoInput,
      workspaceId,
    );
  }

  @UseGuards(WorkspaceAuthGuard, EnterpriseFeaturesEnabledGuard)
  @Mutation(() => DeleteSsoDTO)
  async deleteSSOIdentityProvider(
    @Args('input') { identityProviderId }: DeleteSsoInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.ssoService.deleteSsoIdentityProvider(
      identityProviderId,
      workspaceId,
    );
  }

  @UseGuards(WorkspaceAuthGuard, EnterpriseFeaturesEnabledGuard)
  @Mutation(() => EditSsoDTO)
  async editSSOIdentityProvider(
    @Args('input') input: EditSsoInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.ssoService.editSsoIdentityProvider(input, workspaceId);
  }
}
