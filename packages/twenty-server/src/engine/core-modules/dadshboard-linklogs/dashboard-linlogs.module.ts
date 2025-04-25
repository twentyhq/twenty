import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TraceableController } from 'src/engine/core-modules/dadshboard-linklogs/controllers/traceable-controller';
import { DashboardLinklogsResolver } from 'src/engine/core-modules/dadshboard-linklogs/dashboard-linklogs.resolver';
import { TraceableService } from 'src/engine/core-modules/dadshboard-linklogs/services/traceable.service';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [TwentyConfigModule, TypeOrmModule.forFeature([Workspace], 'core')],
  providers: [DashboardLinklogsResolver, TraceableService, TwentyConfigService],
  controllers: [TraceableController],
})
export class DashboardLinklogsModule {}
