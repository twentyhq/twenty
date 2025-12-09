/* @license Enterprise */

import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { EnterpriseFeaturesEnabledGuard } from 'src/engine/core-modules/auth/guards/enterprise-features-enabled.guard';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { DeleteSsoInput } from 'src/engine/core-modules/sso/dtos/delete-sso.input';
import { DeleteSsoOutput } from 'src/engine/core-modules/sso/dtos/delete-sso.output';
import { EditSsoInput } from 'src/engine/core-modules/sso/dtos/edit-sso.input';
import { EditSsoOutput } from 'src/engine/core-modules/sso/dtos/edit-sso.output';
import { FindAvailableSSOIDPOutput } from 'src/engine/core-modules/sso/dtos/find-available-SSO-IDP.output';
import {
  SetupOIDCSsoInput,
  SetupSAMLSsoInput,
} from 'src/engine/core-modules/sso/dtos/setup-sso.input';
import { SetupSsoOutput } from 'src/engine/core-modules/sso/dtos/setup-sso.output';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import { type SSOException } from 'src/engine/core-modules/sso/sso.exception';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@Resolver()
@UseFilters(
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
@UsePipes(ResolverValidationPipe)
@UseGuards(SettingsPermissionGuard(PermissionFlagType.SECURITY))
export class SSOResolver {
  constructor(private readonly sSOService: SSOService) {}

  @UseGuards(WorkspaceAuthGuard, EnterpriseFeaturesEnabledGuard)
  @Mutation(() => SetupSsoOutput)
  async createOIDCIdentityProvider(
    @Args('input') setupSsoInput: SetupOIDCSsoInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<SetupSsoOutput | SSOException> {
    return this.sSOService.createOIDCIdentityProvider(
      setupSsoInput,
      workspaceId,
    );
  }

  @UseGuards(WorkspaceAuthGuard, EnterpriseFeaturesEnabledGuard)
  @Query(() => [FindAvailableSSOIDPOutput])
  async getSSOIdentityProviders(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.sSOService.getSSOIdentityProviders(workspaceId);
  }

  @UseGuards(WorkspaceAuthGuard, EnterpriseFeaturesEnabledGuard)
  @Mutation(() => SetupSsoOutput)
  async createSAMLIdentityProvider(
    @Args('input') setupSsoInput: SetupSAMLSsoInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<SetupSsoOutput | SSOException> {
    return this.sSOService.createSAMLIdentityProvider(
      setupSsoInput,
      workspaceId,
    );
  }

  @UseGuards(WorkspaceAuthGuard, EnterpriseFeaturesEnabledGuard)
  @Mutation(() => DeleteSsoOutput)
  async deleteSSOIdentityProvider(
    @Args('input') { identityProviderId }: DeleteSsoInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.sSOService.deleteSSOIdentityProvider(
      identityProviderId,
      workspaceId,
    );
  }

  @UseGuards(WorkspaceAuthGuard, EnterpriseFeaturesEnabledGuard)
  @Mutation(() => EditSsoOutput)
  async editSSOIdentityProvider(
    @Args('input') input: EditSsoInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.sSOService.editSSOIdentityProvider(input, workspaceId);
  }
}
