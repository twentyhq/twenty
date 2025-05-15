import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TraceableController } from 'src/engine/core-modules/dadshboard-linklogs/controllers/traceable-controller';
import { DashboardLinklogsResolver } from 'src/engine/core-modules/dadshboard-linklogs/dashboard-linklogs.resolver';
import { TraceableService } from 'src/engine/core-modules/dadshboard-linklogs/services/traceable.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace], 'core')],
  providers: [DashboardLinklogsResolver, TraceableService],
  controllers: [TraceableController],
})
export class DashboardLinklogsModule {}
