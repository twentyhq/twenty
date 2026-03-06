import { Controller, Get, UseGuards } from '@nestjs/common';

import { type ClientConfig } from 'src/engine/core-modules/client-config/client-config.entity';
import { ClientConfigService } from 'src/engine/core-modules/client-config/services/client-config.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller('/client-config')
export class ClientConfigController {
  constructor(private readonly clientConfigService: ClientConfigService) {}

  @Get()
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async getClientConfig(): Promise<ClientConfig> {
    return this.clientConfigService.getClientConfig();
  }
}
