import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';

import { type Request, type Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

import { WorkspaceBrandingService } from './workspace-branding.service';

@Controller()
export class WorkspaceBrandingController {
  constructor(
    private readonly workspaceBrandingService: WorkspaceBrandingService,
  ) {}

  @Get('favicon.ico')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async getFavicon(@Req() request: Request, @Res() response: Response) {
    const branding =
      await this.workspaceBrandingService.getBrandingFromRequest(request);

    if (!isDefined(branding)) {
      response.status(404).send();

      return;
    }

    response.setHeader('Cache-Control', 'public, max-age=300');
    response.redirect(302, branding.logoUrl);
  }
}
