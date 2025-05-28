import { Query, Resolver } from '@nestjs/graphql';

import { ClientConfigService } from 'src/engine/core-modules/client-config/services/client-config.service';

import { ClientConfig } from './client-config.entity';

@Resolver()
export class ClientConfigResolver {
  constructor(private clientConfigService: ClientConfigService) {}

  @Query(() => ClientConfig)
  async clientConfig(): Promise<ClientConfig> {
    return this.clientConfigService.getClientConfig();
  }
}
