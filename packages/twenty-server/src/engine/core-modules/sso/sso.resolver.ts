/* @license Enterprise */

import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import omit from 'lodash.omit';

import { EnterpriseFeaturesEnabledGuard } from 'src/engine/core-modules/auth/guards/enterprise-features-enabled.guard';
import { DeleteSsoInput } from 'src/engine/core-modules/sso/dtos/delete-sso.input';
import { DeleteSsoOutput } from 'src/engine/core-modules/sso/dtos/delete-sso.output';
import { EditSsoInput } from 'src/engine/core-modules/sso/dtos/edit-sso.input';
import { EditSsoOutput } from 'src/engine/core-modules/sso/dtos/edit-sso.output';
import { FindAvailableSSOIDPOutput } from 'src/engine/core-modules/sso/dtos/find-available-SSO-IDP.output';
import { GetAuthorizationUrlInput } from 'src/engine/core-modules/sso/dtos/get-authorization-url.input';
import { GetAuthorizationUrlOutput } from 'src/engine/core-modules/sso/dtos/get-authorization-url.output';
import {
  SetupOIDCSsoInput,
  SetupSAMLSsoInput,
} from 'src/engine/core-modules/sso/dtos/setup-sso.input';
import { SetupSsoOutput } from 'src/engine/core-modules/sso/dtos/setup-sso.output';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import { SSOException } from 'src/engine/core-modules/sso/sso.exception';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Resolver()
export class SSOResolver {
  constructor(private readonly sSOService: SSOService) {}

  @UseGuards(WorkspaceAuthGuard, EnterpriseFeaturesEnabledGuard)
  @Mutation(() => SetupSsoOutput)
  async createOIDCIdentityProvider(
    @Args('input') setupSsoInput: SetupOIDCSsoInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ): Promise<SetupSsoOutput | SSOException> {
    return this.sSOService.createOIDCIdentityProvider(
      setupSsoInput,
      workspaceId,
    );
  }

  @UseGuards(EnterpriseFeaturesEnabledGuard)
  @Query(() => [FindAvailableSSOIDPOutput])
  async listSSOIdentityProvidersByWorkspaceId(
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.sSOService.listSSOIdentityProvidersByWorkspaceId(workspaceId);
  }

  @Mutation(() => GetAuthorizationUrlOutput)
  async getAuthorizationUrl(@Args('input') params: GetAuthorizationUrlInput) {
    return await this.sSOService.getAuthorizationUrl(
      params.identityProviderId,
      omit(params, ['identityProviderId']),
    );
  }

  @UseGuards(WorkspaceAuthGuard, EnterpriseFeaturesEnabledGuard)
  @Mutation(() => SetupSsoOutput)
  async createSAMLIdentityProvider(
    @Args('input') setupSsoInput: SetupSAMLSsoInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
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
    @AuthWorkspace() { id: workspaceId }: Workspace,
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
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.sSOService.editSSOIdentityProvider(input, workspaceId);
  }
}
