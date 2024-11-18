import { Controller, Get, Req, Res, UseFilters } from '@nestjs/common';

import { Request, Response } from 'express';

import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { buildWorkspaceURL } from 'src/utils/workspace-url.utils';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { isDefined } from 'src/utils/is-defined';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import ServerUrl from 'src/engine/utils/serverUrl';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';

@Controller('auth/redirect')
@UseFilters(AuthRestApiExceptionFilter)
export class SignUpAuthController {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly authService: AuthService,
    private readonly workspaceService: WorkspaceService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @Get()
  async redirect(@Req() request: Request, @Res() res: Response) {
    if (
      !isDefined(request?.query?.accessToken) ||
      typeof request.query.accessToken !== 'string'
    ) {
      throw new AuthException(
        'Invalid access token',
        AuthExceptionCode.OAUTH_ACCESS_DENIED,
      );
    }

    const { user, workspace } = await this.accessTokenService.validateToken(
      request.query.accessToken,
    );

    if (!isDefined(user)) {
      throw new AuthException(
        'Invalid access token',
        AuthExceptionCode.OAUTH_ACCESS_DENIED,
      );
    }

    const { tokens } = await this.authService.verify(user.email, workspace.id);

    const redirectUrl = buildWorkspaceURL(
      this.environmentService.get('FRONT_BASE_URL'),
      this.workspaceService.getSubdomainIfMultiworkspaceEnabled(
        user.defaultWorkspace,
      ),
    );

    res.cookie(
      `${workspace.subdomain ?? 'twentyRoot'}TokenPair`,
      JSON.stringify(tokens),
      {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week
        domain: `.${redirectUrl.hostname}`,
        secure: new URL(ServerUrl.get()).protocol === 'https:',
      },
    );

    return res.status(200).redirect(redirectUrl.toString());
  }
}
