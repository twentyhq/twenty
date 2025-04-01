import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';

@Injectable()
export class GitHubProviderEnabledGuard implements CanActivate {
  constructor(private readonly environmentService: EnvironmentService) {}

  canActivate(context: ExecutionContext): boolean {
    const isGitHubEnabled = this.environmentService.get('AUTH_GITHUB_ENABLED');

    if (!isGitHubEnabled) {
      throw new AuthException(
        'GitHub authentication is not enabled',
        AuthExceptionCode.OAUTH_PROVIDER_DISABLED,
      );
    }

    return true;
  }
}