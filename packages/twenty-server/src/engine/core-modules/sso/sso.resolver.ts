import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import {
  SetupOIDCSsoInput,
  SetupSAMLSsoInput,
} from 'src/engine/core-modules/sso/dtos/setup-sso.input';
import { IdpType } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { SetupSsoOutput } from 'src/engine/core-modules/sso/dtos/setup-sso.output';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
export class SSOResolver {
  constructor(private readonly ssoService: SSOService) {}

  @Mutation(() => SetupSsoOutput)
  async createOIDCIdentityProvider(
    @Args('input') setupSsoInput: SetupOIDCSsoInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.ssoService.createSSOIdentityProvider(
      { ...setupSsoInput, type: IdpType.OIDC },
      workspaceId,
    );
  }

  @Mutation(() => SetupSsoOutput)
  async createSAMLIdentityProvider(
    @Args('input') setupSsoInput: SetupSAMLSsoInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.ssoService.createSSOIdentityProvider(
      { ...setupSsoInput, type: IdpType.SAML },
      workspaceId,
    );
  }
}
