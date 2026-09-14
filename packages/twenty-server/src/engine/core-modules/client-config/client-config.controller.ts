import { Controller, Get, Header, UseGuards } from '@nestjs/common';

import { ApiPath } from 'twenty-shared/types';

import { type ClientConfig } from 'src/engine/core-modules/client-config/client-config.entity';
import { ClientConfigService } from 'src/engine/core-modules/client-config/services/client-config.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller(ApiPath.ClientConfig)
export class ClientConfigController {
  constructor(private readonly clientConfigService: ClientConfigService) {}

  // Every deploy and every config change has to reach clients immediately, so
  // this must never be served from a CDN or browser cache: a stale body still
  // parses and silently drops whatever fields it predates.
  @Get()
  @Header('Cache-Control', 'no-store')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async getClientConfig(): Promise<ClientConfig> {
    return this.clientConfigService.getClientConfig();
  }
}
