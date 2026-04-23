import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardWidgetEntity, AnalyticsReportEntity } from './dashboard-widgets.entity';
import { BIAnalyticsService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([DashboardWidgetEntity, AnalyticsReportEntity])],
  providers: [BIAnalyticsService],
  exports: [BIAnalyticsService],
})
export class BIAnalyticsModule {}