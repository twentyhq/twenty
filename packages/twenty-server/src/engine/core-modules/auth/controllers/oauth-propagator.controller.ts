import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Query,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller('auth/oauth-propagator')
@UseFilters(AuthRestApiExceptionFilter)
export class OAuthPropagatorController {
  constructor(
    private readonly domainServerConfigService: DomainServerConfigService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
  ) {}

  @Get('callback')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async propagateOAuthCallback(
    @Query('state') state: string,
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    if (!isDefined(state)) {
      throw new BadRequestException('Missing state parameter');
    }

    if (!isDefined(code)) {
      throw new BadRequestException('Missing code parameter');
    }

    const decodedRedirectUri = decodeURIComponent(state);

    let redirectUrl: URL;

    try {
      redirectUrl = new URL(decodedRedirectUri);
    } catch {
      throw new BadRequestException('Invalid redirect URI in state');
    }

    const isValidDomain = await this.isValidDomain(redirectUrl);

    if (!isValidDomain) {
      throw new ForbiddenException(
        `${redirectUrl.hostname} is not a valid Twenty domain`,
      );
    }

    redirectUrl.searchParams.set('code', code);
    redirectUrl.searchParams.set('state', state);

    return res.redirect(302, redirectUrl.toString());
  }

  private async isValidDomain(url: URL): Promise<boolean> {
    if (
      this.twentyConfigService.get('NODE_ENV') === NodeEnvironment.DEVELOPMENT
    ) {
      return true;
    }

    const workspace =
      await this.workspaceDomainsService.getWorkspaceByOriginOrDefaultWorkspace(
        url.href,
      );

    return isDefined(workspace);
  }
}
