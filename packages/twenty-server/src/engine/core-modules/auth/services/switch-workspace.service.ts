import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { AuthProviders } from 'src/engine/core-modules/workspace/dtos/public-workspace-data-output';
import { getAuthProvidersByWorkspace } from 'src/engine/core-modules/workspace/utils/get-auth-providers-by-workspace.util';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';

@Injectable()
export class SwitchWorkspaceService {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly environmentService: EnvironmentService,
  ) {}

  async switchWorkspace(user: User, workspaceId: string) {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      relations: ['workspaceUsers', 'workspaceSSOIdentityProviders'],
    });

    workspaceValidator.assertIsDefinedOrThrow(
      workspace,
      new AuthException('Workspace not found', AuthExceptionCode.INVALID_INPUT),
    );

    if (
      !workspace.workspaceUsers
        .map((userWorkspace) => userWorkspace.userId)
        .includes(user.id)
    ) {
      throw new AuthException(
        'user does not belong to workspace',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const systemEnabledProviders: AuthProviders = {
      google: this.environmentService.get('AUTH_GOOGLE_ENABLED'),
      magicLink: false,
      password: this.environmentService.get('AUTH_PASSWORD_ENABLED'),
      microsoft: this.environmentService.get('AUTH_MICROSOFT_ENABLED'),
      sso: [],
    };

    return {
      id: workspace.id,
      subdomain: workspace.subdomain,
      logo: workspace.logo,
      displayName: workspace.displayName,
      authProviders: getAuthProvidersByWorkspace({
        workspace,
        systemEnabledProviders,
      }),
    };
  }
}
