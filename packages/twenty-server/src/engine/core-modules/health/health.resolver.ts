import { Query, Resolver } from '@nestjs/graphql';

import { HealthCacheService } from 'src/engine/core-modules/health/health-cache.service';
import { HealthSystem } from 'src/engine/core-modules/health/types/health-system.types';

@Resolver()
export class AdminHealthResolver {
  constructor(private readonly healthCacheService: HealthCacheService) {}

  @Query(() => HealthSystem)
  async adminSystemHealth(): Promise<HealthSystem> {
    return this.healthCacheService.getSystemStatus();
  }
}
