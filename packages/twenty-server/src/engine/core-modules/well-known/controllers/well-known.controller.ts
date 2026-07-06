import { Controller, Get, Header, Req, UseGuards } from '@nestjs/common';

import { type Request } from 'express';

import { buildApiCatalog } from 'src/engine/core-modules/well-known/utils/build-api-catalog.util';
import { buildMcpServerCard } from 'src/engine/core-modules/well-known/utils/build-mcp-server-card.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { getRequestBaseUrl } from 'src/utils/get-request-base-url.util';
import { extractVersionMajorMinorPatch } from 'src/utils/version/extract-version-major-minor-patch';

const DISCOVERY_CACHE_CONTROL = 'public, max-age=3600';
const FALLBACK_SERVER_VERSION = '0.0.0';

@Controller('.well-known')
export class WellKnownController {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  @Get('mcp/server-card.json')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @Header('Cache-Control', DISCOVERY_CACHE_CONTROL)
  getMcpServerCard(@Req() request: Request) {
    const version =
      extractVersionMajorMinorPatch(
        this.twentyConfigService.get('APP_VERSION'),
      ) ?? FALLBACK_SERVER_VERSION;

    return buildMcpServerCard({
      baseUrl: getRequestBaseUrl(request),
      version,
    });
  }

  // Return a string so Nest keeps the explicit linkset+json Content-Type.
  @Get('api-catalog')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @Header(
    'Content-Type',
    'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
  )
  @Header('Cache-Control', DISCOVERY_CACHE_CONTROL)
  getApiCatalog(@Req() request: Request): string {
    return JSON.stringify(buildApiCatalog(getRequestBaseUrl(request)), null, 2);
  }
}
