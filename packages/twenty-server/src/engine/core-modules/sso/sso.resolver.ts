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
import { LoginSSOInput } from 'src/engine/core-modules/sso/dtos/login-sso.input';
import { LoginSSOOutput } from 'src/engine/core-modules/sso/dtos/login-sso.output';
import { SSOProviderEnabledGuard } from 'src/engine/core-modules/auth/guards/sso-provider-enabled.guard';
import { FindAvailableSSOIDPInput } from 'src/engine/core-modules/sso/dtos/find-available-SSO-IDP.input';
import { FindAvailableSSOIDPOutput } from 'src/engine/core-modules/sso/dtos/find-available-SSO-IDP.output';

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
    @Args('input') { email }: FindAvailableSSOIDPInput,
  ) {
    return this.sSOService.findAvailableSSOIdentityProviders(email);
  }

  @UseGuards(SSOProviderEnabledGuard)
  @Query(() => [FindAvailableSSOIDPOutput])
  async listSSOIdentityProvidersByWorkspaceId(
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.sSOService.listSSOIdentityProvidersByWorkspaceId(workspaceId);
  }

  @Mutation(() => LoginSSOOutput)
  async loginWithSSO(@Args('input') { idpId }: LoginSSOInput) {
    return this.sSOService.loginWithSSO(idpId);
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
}
