import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminPanelResolver } from 'src/engine/core-modules/admin-panel/admin-panel.resolver';
import { AdminPanelService } from 'src/engine/core-modules/admin-panel/admin-panel.service';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Workspace, FeatureFlag], 'core'),
    AuthModule,
    DomainManagerModule,
  ],
  providers: [AdminPanelResolver, AdminPanelService],
  exports: [AdminPanelService],
})
export class AdminPanelModule {}
