import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardWidgetEntity, AnalyticsReportEntity, WidgetType, DataSource } from './dashboard-widgets.entity';

@Injectable()
export class BIAnalyticsService {
  constructor(
    @InjectRepository(DashboardWidgetEntity)
    private readonly widgetRepo: Repository<DashboardWidgetEntity>,
    @InjectRepository(AnalyticsReportEntity)
    private readonly reportRepo: Repository<AnalyticsReportEntity>,
  ) {}

  async createWidget(
    workspaceId: string,
    dashboardId: string,
    data: Partial<DashboardWidgetEntity>,
  ): Promise<DashboardWidgetEntity> {
    const widget = this.widgetRepo.create({ ...data, workspaceId, dashboardId });
    return this.widgetRepo.save(widget);
  }

  async getWidgets(workspaceId: string, dashboardId: string): Promise<DashboardWidgetEntity[]> {
    return this.widgetRepo.find({ where: { workspaceId, dashboardId }, order: { positionY: 'ASC', positionX: 'ASC' } });
  }

  async updateWidget(id: string, updates: Partial<DashboardWidgetEntity>): Promise<DashboardWidgetEntity> {
    await this.widgetRepo.update(id, updates);
    return this.widgetRepo.findOne({ where: { id } });
  }

  async deleteWidget(id: string): Promise<void> {
    await this.widgetRepo.delete(id);
  }

  async createReport(workspaceId: string, data: Partial<AnalyticsReportEntity>): Promise<AnalyticsReportEntity> {
    const report = this.reportRepo.create({ ...data, workspaceId });
    return this.reportRepo.save(report);
  }

  async getReports(workspaceId: string): Promise<AnalyticsReportEntity[]> {
    return this.reportRepo.find({ where: { workspaceId }, order: { createdAt: 'DESC' } });
  }

  async runReport(id: string): Promise<Record<string, unknown>[]> {
    const report = await this.reportRepo.findOne({ where: { id } });
    if (!report) return [];

    console.log(`Running report: ${report.name} with metrics: ${report.metrics?.join(', ')}`);
    
    const sampleData = [
      { period: '2024-01', value: 125000, count: 45 },
      { period: '2024-02', value: 148000, count: 52 },
      { period: '2024-03', value: 132000, count: 48 },
    ];

    return sampleData;
  }

  async getKPIData(workspaceId: string, metric: string): Promise<{ value: number; change: number }> {
    return { value: Math.floor(Math.random() * 100000), change: Math.random() * 20 - 10 };
  }
}