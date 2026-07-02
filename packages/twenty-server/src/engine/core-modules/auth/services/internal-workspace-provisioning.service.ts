import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ApiKeyService } from 'src/engine/core-modules/api-key/services/api-key.service';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const DEFAULT_SERVICE_USER_EMAIL = 'twenty-workspace-provisioning@regie.ai';

type CreateWorkspaceInput = {
  name?: string;
  slug?: string;
  primaryDomain?: string;
  serviceUserEmail?: string;
};

type CreateWorkspaceApiKeyInput = {
  name?: string;
  expiresAt?: string;
};

@Injectable()
export class InternalWorkspaceProvisioningService {
  constructor(
    private readonly signInUpService: SignInUpService,
    private readonly userService: UserService,
    private readonly workspaceService: WorkspaceService,
    private readonly apiKeyService: ApiKeyService,
  ) {}

  async createWorkspace(input: CreateWorkspaceInput) {
    const displayName = this.requiredTrimmed(input.name, 'name');
    const subdomain = this.requiredTrimmed(input.slug, 'slug');
    const serviceUserEmail = this.getServiceUserEmail(input.serviceUserEmail);
    const existingUser =
      await this.userService.findUserByEmail(serviceUserEmail);

    const result = await this.signInUpService.signUpOnNewWorkspace(
      existingUser
        ? { type: 'existingUser', existingUser }
        : {
            type: 'newUserWithPicture',
            newUserWithPicture: {
              email: serviceUserEmail,
              firstName: 'Regie',
              lastName: 'Provisioning',
              isEmailAlreadyVerified: true,
            },
          },
      { displayName, subdomain },
    );
    const workspace =
      (await this.workspaceService.activateWorkspace(
        result.user,
        result.workspace,
      )) ?? result.workspace;

    return this.toWorkspaceProvisioningResponse(workspace, input.primaryDomain);
  }

  async activateWorkspace(workspaceId: string) {
    const serviceUserEmail = this.getServiceUserEmail();
    const user = await this.userService.findUserByEmail(serviceUserEmail);
    const workspace =
      await this.workspaceService.findOneWorkspaceById(workspaceId);

    if (!user) {
      throw new NotFoundException('Workspace provisioning user was not found');
    }

    if (!workspace) {
      throw new NotFoundException('Workspace was not found');
    }

    const activatedWorkspace =
      (await this.workspaceService.activateWorkspace(user, workspace)) ??
      workspace;

    return this.toWorkspaceProvisioningResponse(activatedWorkspace);
  }

  async createWorkspaceApiKey(
    workspaceId: string,
    input: CreateWorkspaceApiKeyInput,
  ) {
    const workspace =
      await this.workspaceService.findOneWorkspaceById(workspaceId);

    if (!workspace) {
      throw new NotFoundException('Workspace was not found');
    }

    const apiKey = await this.apiKeyService.createWorkspaceAdminApiKeyToken({
      workspaceId,
      name: input.name?.trim() || 'regie-crm-api',
      expiresAt: input.expiresAt,
    });

    return {
      ok: true,
      workspaceId,
      apiKey: apiKey.token,
      apiKeyId: apiKey.apiKeyId,
    };
  }

  private getServiceUserEmail(email?: string): string {
    return (
      email?.trim().toLowerCase() ||
      process.env.REGIE_WORKSPACE_PROVISIONING_USER_EMAIL ||
      DEFAULT_SERVICE_USER_EMAIL
    );
  }

  private requiredTrimmed(value: string | undefined, field: string): string {
    const trimmedValue = value?.trim();

    if (!trimmedValue) {
      throw new BadRequestException(`Request body must include ${field}`);
    }

    return trimmedValue;
  }

  private toWorkspaceProvisioningResponse(
    workspace: WorkspaceEntity,
    primaryDomain?: string,
  ) {
    const workspaceUrl =
      primaryDomain ??
      (process.env.FRONT_BASE_URL
        ? `https://${workspace.subdomain}.${new URL(process.env.FRONT_BASE_URL).hostname}`
        : undefined);

    return {
      ok: true,
      id: workspace.id,
      workspaceId: workspace.id,
      workspaceUrl,
      workspaceName: workspace.displayName,
      workspaceSubdomain: workspace.subdomain,
    };
  }
}
