import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminPanelResolver } from 'src/engine/core-modules/admin-panel/admin-panel.resolver';
import { AdminPanelService } from 'src/engine/core-modules/admin-panel/admin-panel.service';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { HealthModule } from 'src/engine/core-modules/health/health.module';
import { AdminHealthResolver } from 'src/engine/core-modules/health/health.resolver';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Workspace, FeatureFlag], 'core'),
    AuthModule,
    DomainManagerModule,
    HealthModule,
  ],
  providers: [AdminPanelResolver, AdminPanelService, AdminHealthResolver],
  exports: [AdminPanelService],
})
export class AdminPanelModule {}
