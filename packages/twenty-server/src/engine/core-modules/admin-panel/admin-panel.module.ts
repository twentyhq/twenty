import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminPanelHealthService } from 'src/engine/core-modules/admin-panel/admin-panel-health.service';
import { AdminPanelResolver } from 'src/engine/core-modules/admin-panel/admin-panel.resolver';
import { AdminPanelService } from 'src/engine/core-modules/admin-panel/admin-panel.service';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { HealthModule } from 'src/engine/core-modules/health/health.module';
import { RedisClientModule } from 'src/engine/core-modules/redis-client/redis-client.module';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Workspace, FeatureFlag], 'core'),
    AuthModule,
    DomainManagerModule,
    HealthModule,
    RedisClientModule,
    TerminusModule,
  ],
  providers: [AdminPanelResolver, AdminPanelService, AdminPanelHealthService],
  exports: [AdminPanelService],
})
export class AdminPanelModule {}
