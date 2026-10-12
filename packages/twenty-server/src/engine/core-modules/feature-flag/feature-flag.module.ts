import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagGaugeService } from 'src/engine/core-modules/feature-flag/services/feature-flag-gauge.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeatureFlagEntity]),
    MetricsModule,
    WorkspaceCacheModule,
  ],
  exports: [FeatureFlagService],
  providers: [
    FeatureFlagService,
    FeatureFlagGaugeService,
    provideWorkspaceScopedRepository(FeatureFlagEntity),
  ],
})
export class FeatureFlagModule {}
