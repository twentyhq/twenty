import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { ApiKeyService } from 'src/engine/core-modules/api-key/api-key.service';
import { CreateUserAndWorkspaceInput } from 'src/engine/core-modules/auth/dto/create-user-and-workspace.input';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { ApiKeyGuard } from 'src/engine/guards/api-key-guard';

@Controller('auth/api')
@UseGuards(ApiKeyGuard)
export class ApiAuthController {
  constructor(
    private readonly signInUpService: SignInUpService,
    private readonly domainManagerService: DomainManagerService,
    private readonly apiKeyService: ApiKeyService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  @Post('create-user-and-workspace')
  async createUserAndWorkspace(@Body() userData: CreateUserAndWorkspaceInput) {
    const { user, workspace } = await this.signInUpService.signUpOnNewWorkspace(
      {
        type: 'newUserWithPicture',
        newUserWithPicture: userData,
      },
    );

    await this.workspaceService.activateWorkspace(user, workspace, {
      displayName: workspace.subdomain,
    });

    // Create an API key for the workspace, valid for 5 year
    const oneYearMs = 5 * 365 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + oneYearMs);

    const apiKey = await this.apiKeyService.create({
      name: 'Webapp',
      workspaceId: workspace.id,
      expiresAt,
    });

    const apiToken = await this.apiKeyService.generateApiKeyToken(
      workspace.id,
      apiKey.id,
    );

    return {
      userId: user.id,
      workspaceId: workspace.id,
      workspaceUrls: this.domainManagerService.getWorkspaceUrls(workspace),
      apiToken: apiToken?.token,
      expiresAt,
    };
  }
}
