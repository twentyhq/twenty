import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { InterService } from 'src/engine/core-modules/inter/inter.service';

import { InterIntegration } from './integration/inter-integration.entity';

@Resolver(() => InterIntegration)
export class InterResolver {
  constructor(private readonly interService: InterService) {}

  @Mutation(() => Boolean)
  async syncInterData(@Args('integrationId') integrationId: string) {
    return this.interService.syncData(integrationId);
  }

  @Query(() => String)
  async getInterAccountInfo(@Args('integrationId') integrationId: string) {
    return this.interService.getAccountInfo(integrationId);
  }

  // Adicione outras mutations/queries específicas da API do Inter
}
