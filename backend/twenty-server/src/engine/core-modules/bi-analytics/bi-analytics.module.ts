import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardWidgetEntity, AnalyticsReportEntity } from './dashboard-widgets.entity';
import { BIAnalyticsService } from './dashboard.service';
import { BIAnalyticsResolver } from './bi-analytics.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([DashboardWidgetEntity, AnalyticsReportEntity])],
  providers: [BIAnalyticsService, BIAnalyticsResolver],
  exports: [BIAnalyticsService],
})
export class BIAnalyticsModule {}