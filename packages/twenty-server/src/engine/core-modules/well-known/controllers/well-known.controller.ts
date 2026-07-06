import { Controller, Get, Header, Req, UseGuards } from '@nestjs/common';

import { type Request } from 'express';

import {
  API_CATALOG_CONTENT_TYPE,
  DISCOVERY_CACHE_CONTROL,
} from 'src/engine/core-modules/well-known/constants/well-known.constants';
import { buildApiCatalog } from 'src/engine/core-modules/well-known/utils/build-api-catalog.util';
import { buildMcpServerCard } from 'src/engine/core-modules/well-known/utils/build-mcp-server-card.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { getRequestBaseUrl } from 'src/utils/get-request-base-url.util';
import { extractVersionMajorMinorPatch } from 'src/utils/version/extract-version-major-minor-patch';

// Semver placeholder when APP_VERSION is unset (some self-hosted/dev builds),
// so the card's required `version` field always holds a valid value.
const FALLBACK_SERVER_VERSION = '0.0.0';

// Serves vendor-neutral discovery documents so catalogs and agents can find
// Twenty's MCP + REST/GraphQL surfaces from a URL. Every document is built from
// the request host, so each workspace subdomain / custom domain / self-hosted
// instance advertises its own connectable endpoints. Public + CORS so
// browser-based discovery clients can read them.
@Controller('.well-known')
export class WellKnownController {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  @Get('mcp/server-card.json')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @Header('Cache-Control', DISCOVERY_CACHE_CONTROL)
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Access-Control-Allow-Methods', 'GET')
  @Header('Access-Control-Allow-Headers', 'Content-Type')
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

  // Returned pre-serialized: RFC 9727 mandates the application/linkset+json
  // media type, which returning a raw object would override with
  // application/json. Sending a string lets the explicit Content-Type stand.
  @Get('api-catalog')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @Header('Content-Type', API_CATALOG_CONTENT_TYPE)
  @Header('Cache-Control', DISCOVERY_CACHE_CONTROL)
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Access-Control-Allow-Methods', 'GET')
  @Header('Access-Control-Allow-Headers', 'Content-Type')
  getApiCatalog(@Req() request: Request): string {
    const apiCatalog = buildApiCatalog(getRequestBaseUrl(request));

    return JSON.stringify(apiCatalog, null, 2);
  }
}
