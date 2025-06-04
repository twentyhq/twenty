import { Controller, Get, UseGuards } from '@nestjs/common';

import { ClientConfig } from 'src/engine/core-modules/client-config/client-config.entity';
import { ClientConfigService } from 'src/engine/core-modules/client-config/services/client-config.service';
import { PublicEndpoint } from 'src/engine/guards/public-endpoint.guard';

@Controller('/client-config')
export class ClientConfigController {
  constructor(private readonly clientConfigService: ClientConfigService) {}

  @Get()
  @UseGuards(PublicEndpoint)
  async getClientConfig(): Promise<ClientConfig> {
    return this.clientConfigService.getClientConfig();
  }
}
