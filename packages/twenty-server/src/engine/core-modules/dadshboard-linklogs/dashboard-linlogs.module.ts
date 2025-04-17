import { Module } from '@nestjs/common';
import { DashboardLinklogsResolver } from 'src/engine/core-modules/dadshboard-linklogs/dashboard-linklogs.resolver';

@Module({
  providers: [DashboardLinklogsResolver],
})
export class DashboardLinklogsModule {}
