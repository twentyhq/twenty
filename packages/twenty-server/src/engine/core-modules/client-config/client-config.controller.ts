import { Controller, Get } from '@nestjs/common';

import { ClientConfig } from 'src/engine/core-modules/client-config/client-config.entity';
import { ClientConfigService } from 'src/engine/core-modules/client-config/services/client-config.service';

@Controller('/client-config')
export class ClientConfigController {
  constructor(private readonly clientConfigService: ClientConfigService) {}

  @Get()
  async getClientConfig(): Promise<ClientConfig> {
    return this.clientConfigService.getClientConfig();
  }
}
