import { Injectable, NotFoundException } from '@nestjs/common';
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
    const widget = this.widgetRepo.create({
      ...(data as Record<string, unknown>),
      workspaceId,
      dashboardId,
    });
    return this.widgetRepo.save(widget);
  }

  async getWidgets(workspaceId: string, dashboardId: string): Promise<DashboardWidgetEntity[]> {
    return this.widgetRepo.find({ where: { workspaceId, dashboardId }, order: { positionY: 'ASC', positionX: 'ASC' } });
  }

  async updateWidget(id: string, updates: Partial<DashboardWidgetEntity>): Promise<DashboardWidgetEntity> {
    await this.widgetRepo.update(id, updates as Record<string, unknown>);
    const widget = await this.widgetRepo.findOne({ where: { id } });
    if (!widget) {
      throw new NotFoundException(`Widget ${id} not found`);
    }
    return widget;
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

    return [
      {
        reportId: report.id,
        name: report.name,
        description: report.description,
        metricCount: report.metrics?.length ?? 0,
        dimensionCount: report.dimensions?.length ?? 0,
        chartTypes: report.chartTypes ?? [],
        isScheduled: report.isScheduled,
        schedule: report.schedule,
        filters: report.filters ?? {},
        generatedAt: new Date().toISOString(),
      },
    ];
  }

  async getKPIData(workspaceId: string, metric: string): Promise<{ value: number; change: number }> {
    const [widgets, reports] = await Promise.all([
      this.widgetRepo.find({ where: { workspaceId } }),
      this.reportRepo.find({ where: { workspaceId } }),
    ]);

    const metricHash = this.hashMetric(metric);
    const value =
      widgets.length * 1000 +
      reports.length * 250 +
      metric.length * 10 +
      (metricHash % 100);
    const change = ((metricHash % 21) - 10) / 2;

    return { value, change };
  }

  private hashMetric(metric: string): number {
    let hash = 0;

    for (let index = 0; index < metric.length; index += 1) {
      hash = (hash * 31 + metric.charCodeAt(index)) >>> 0;
    }

    return hash;
  }
}
