import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { ClientConfigService } from 'src/engine/core-modules/client-config/services/client-config.service';
import { PublicEndpoint } from 'src/engine/guards/public-endpoint.guard';

import { ClientConfig } from './client-config.entity';

@Resolver()
export class ClientConfigResolver {
  constructor(private clientConfigService: ClientConfigService) {}

  @Query(() => ClientConfig)
  @UseGuards(PublicEndpoint)
  async clientConfig(): Promise<ClientConfig> {
    return this.clientConfigService.getClientConfig();
  }
}
