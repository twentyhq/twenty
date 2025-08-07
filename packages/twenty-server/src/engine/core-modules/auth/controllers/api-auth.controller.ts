import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { ApiKeyService } from 'src/engine/core-modules/api-key/api-key.service';
import { CreateUserAndWorkspaceInput } from 'src/engine/core-modules/auth/dto/create-user-and-workspace.input';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { ApiKeyGuard } from 'src/engine/guards/api-key-guard';
import { UnknownException } from 'src/utils/custom-exception';

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

    const activatedWorkspace = await this.workspaceService.activateWorkspace(
      user,
      workspace,
      {
        displayName: workspace.subdomain,
      },
    );

    if (!activatedWorkspace?.defaultRoleId) {
      throw new UnknownException(
        'Default role not found for the workspace',
        'NO_DEFAULT_ROLE',
      );
    }

    const oneYearMs = 1000 * 60 * 60 * 24 * 365;
    const expiresInMs = process.env.API_KEY_EXPIRES_IN_MS
      ? parseInt(process.env.API_KEY_EXPIRES_IN_MS)
      : oneYearMs;
    const expiresAt = new Date(Date.now() + expiresInMs);

    const apiKey = await this.apiKeyService.create({
      name: 'Webapp',
      workspaceId: workspace.id,
      expiresAt,
      roleId: activatedWorkspace?.defaultRoleId,
    });

    const apiToken = await this.apiKeyService.generateApiKeyToken(
      workspace.id,
      apiKey.id,
    );

    return {
      userId: user.id,
      workspaceId: workspace.id,
      workspaceUrl:
        this.domainManagerService.getWorkspaceUrls(workspace).subdomainUrl,
      apiKeyId: apiKey.id,
      apiToken: apiToken?.token,
      expiresAt,
    };
  }
}
