import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import {
  SetupOIDCSsoInput,
  SetupSAMLSsoInput,
} from 'src/engine/core-modules/sso/dtos/setup-sso.input';
import { SetupSsoOutput } from 'src/engine/core-modules/sso/dtos/setup-sso.output';
import { GetAuthorizationUrlInput } from 'src/engine/core-modules/sso/dtos/get-authorization-url.input';
import { GetAuthorizationUrlOutput } from 'src/engine/core-modules/sso/dtos/get-authorization-url.output';
import { SSOProviderEnabledGuard } from 'src/engine/core-modules/auth/guards/sso-provider-enabled.guard';
import { FindAvailableSSOIDPInput } from 'src/engine/core-modules/sso/dtos/find-available-SSO-IDP.input';
import { FindAvailableSSOIDPOutput } from 'src/engine/core-modules/sso/dtos/find-available-SSO-IDP.output';
import { DeleteSsoInput } from 'src/engine/core-modules/sso/dtos/delete-sso.input';
import { DeleteSsoOutput } from 'src/engine/core-modules/sso/dtos/delete-sso.output';
import { EditSsoInput } from 'src/engine/core-modules/sso/dtos/edit-sso.input';
import { EditSsoOutput } from 'src/engine/core-modules/sso/dtos/edit-sso.output';

@Resolver()
export class SSOResolver {
  constructor(private readonly sSOService: SSOService) {}

  @UseGuards(WorkspaceAuthGuard, SSOProviderEnabledGuard)
  @Mutation(() => SetupSsoOutput)
  async createOIDCIdentityProvider(
    @Args('input') setupSsoInput: SetupOIDCSsoInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.sSOService.createOIDCIdentityProvider(
      setupSsoInput,
      workspaceId,
    );
  }

  @UseGuards(SSOProviderEnabledGuard)
  @Mutation(() => [FindAvailableSSOIDPOutput])
  async findAvailableSSOIdentityProviders(
    @Args('input') input: FindAvailableSSOIDPInput,
  ) {
    return this.sSOService.findAvailableSSOIdentityProviders(input.email);
  }

  @UseGuards(SSOProviderEnabledGuard)
  @Query(() => [FindAvailableSSOIDPOutput])
  async listSSOIdentityProvidersByWorkspaceId(
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.sSOService.listSSOIdentityProvidersByWorkspaceId(workspaceId);
  }

  @Mutation(() => GetAuthorizationUrlOutput)
  async getAuthorizationUrl(
    @Args('input') { idpId }: GetAuthorizationUrlInput,
  ) {
    return this.sSOService.getAuthorizationUrl(idpId);
  }

  @UseGuards(WorkspaceAuthGuard, SSOProviderEnabledGuard)
  @Mutation(() => SetupSsoOutput)
  async createSAMLIdentityProvider(
    @Args('input') setupSsoInput: SetupSAMLSsoInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.sSOService.createSAMLIdentityProvider(
      setupSsoInput,
      workspaceId,
    );
  }

  @UseGuards(WorkspaceAuthGuard, SSOProviderEnabledGuard)
  @Mutation(() => DeleteSsoOutput)
  async deleteSSOIdentityProvider(
    @Args('input') { idpId }: DeleteSsoInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.sSOService.deleteSSOIdentityProvider(idpId, workspaceId);
  }

  @UseGuards(WorkspaceAuthGuard, SSOProviderEnabledGuard)
  @Mutation(() => EditSsoOutput)
  async editSSOIdentityProvider(
    @Args('input') input: EditSsoInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.sSOService.editSSOIdentityProvider(input, workspaceId);
  }
}
