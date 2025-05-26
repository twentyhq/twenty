import { Query, Resolver } from '@nestjs/graphql';

import { ClientConfig } from './client-config.entity';
import { ClientConfigService } from './client-config.service';

@Resolver()
export class ClientConfigResolver {
  constructor(private clientConfigService: ClientConfigService) {}

  @Query(() => ClientConfig)
  async clientConfig(): Promise<ClientConfig> {
    return this.clientConfigService.generateClientConfig();
  }
}
