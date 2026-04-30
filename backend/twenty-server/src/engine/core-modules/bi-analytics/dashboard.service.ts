import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource as TypeORMDataSource } from 'typeorm';
import { DashboardWidgetEntity, AnalyticsReportEntity, WidgetType, DataSource } from './dashboard-widgets.entity';

@Injectable()
export class BIAnalyticsService {
  constructor(
    @InjectRepository(DashboardWidgetEntity)
    private readonly widgetRepo: Repository<DashboardWidgetEntity>,
    @InjectRepository(AnalyticsReportEntity)
    private readonly reportRepo: Repository<AnalyticsReportEntity>,
    private readonly dataSource: TypeORMDataSource,
  ) {}

  async createWidget(
    workspaceId: string,
    dashboardId: string,
    data: Partial<DashboardWidgetEntity>,
  ): Promise<DashboardWidgetEntity> {
    return this.widgetRepo.save(this.widgetRepo.create({ ...data as Record<string, unknown>, workspaceId, dashboardId }));
  }

  async getWidgets(workspaceId: string, dashboardId: string): Promise<DashboardWidgetEntity[]> {
    return this.widgetRepo.find({ where: { workspaceId, dashboardId }, order: { positionY: 'ASC', positionX: 'ASC' } });
  }

  async updateWidget(id: string, updates: Partial<DashboardWidgetEntity>): Promise<DashboardWidgetEntity> {
    await this.widgetRepo.update(id, updates as Record<string, unknown>);
    const widget = await this.widgetRepo.findOne({ where: { id } });
    if (!widget) throw new NotFoundException(`Widget ${id} not found`);
    return widget;
  }

  async deleteWidget(id: string): Promise<void> {
    await this.widgetRepo.delete(id);
  }

  async createReport(workspaceId: string, data: Partial<AnalyticsReportEntity>): Promise<AnalyticsReportEntity> {
    return this.reportRepo.save(this.reportRepo.create({ ...data, workspaceId }));
  }

  async getReports(workspaceId: string): Promise<AnalyticsReportEntity[]> {
    return this.reportRepo.find({ where: { workspaceId }, order: { createdAt: 'DESC' } });
  }

  async runReport(id: string): Promise<Record<string, unknown>[]> {
    const report = await this.reportRepo.findOne({ where: { id } });
    if (!report) return [];
    const results: Record<string, unknown>[] = [];
    for (const metric of report.metrics ?? []) {
      const data = await this.queryMetric(report.workspaceId, metric);
      results.push({ metric, ...data });
    }
    return results;
  }

  async getKPIData(workspaceId: string, metric: string): Promise<{ value: number; change: number; trend: string }> {
    const data = await this.queryMetric(workspaceId, metric);
    return {
      value: data.current,
      change: data.previous > 0 ? Math.round(((data.current - data.previous) / data.previous) * 100) : 0,
      trend: data.current >= data.previous ? 'up' : 'down',
    };
  }

  async getRevOpsMetrics(workspaceId: string): Promise<Record<string, { value: number; change: number }>> {
    const metrics = ['total_revenue', 'deal_count', 'avg_deal_size', 'pipeline_value', 'ticket_count', 'call_count'];
    const results: Record<string, { value: number; change: number }> = {};
    for (const m of metrics) {
      const data = await this.queryMetric(workspaceId, m);
      results[m] = {
        value: data.current,
        change: data.previous > 0 ? Math.round(((data.current - data.previous) / data.previous) * 100) : 0,
      };
    }
    return results;
  }

  async getTimeSeriesData(workspaceId: string, metric: string, periodDays: number): Promise<Array<{ date: string; value: number }>> {
    const table = this.getTableForMetric(metric);
    const dateCol = this.getDateColumnForMetric(metric);
    return this.safeQuery(
      `SELECT DATE(${dateCol}) AS "date", COUNT(*)::int AS "value" FROM ${table} WHERE "workspaceId" = $1 AND ${dateCol} >= NOW() - INTERVAL '${periodDays} days' GROUP BY DATE(${dateCol}) ORDER BY "date" ASC`,
      [workspaceId],
    ) as Promise<Array<{ date: string; value: number }>>;
  }

  async getTopPerformers(workspaceId: string, limit = 10): Promise<Array<{ userId: string; value: number }>> {
    return this.safeQuery(
      `SELECT "userId", COUNT(*)::int AS "value" FROM call_log WHERE "workspaceId" = $1 AND status = 'completed' GROUP BY "userId" ORDER BY "value" DESC LIMIT $2`,
      [workspaceId, limit],
    ) as Promise<Array<{ userId: string; value: number }>>;
  }

  private async queryMetric(workspaceId: string, metric: string): Promise<{ current: number; previous: number }> {
    const table = this.getTableForMetric(metric);
    const dateCol = this.getDateColumnForMetric(metric);
    const aggFn = this.getAggForMetric(metric);
    const [curr] = await this.safeQuery(`SELECT ${aggFn} AS "value" FROM ${table} WHERE "workspaceId" = $1 AND ${dateCol} >= NOW() - INTERVAL '30 days'`, [workspaceId]);
    const [prev] = await this.safeQuery(`SELECT ${aggFn} AS "value" FROM ${table} WHERE "workspaceId" = $1 AND ${dateCol} BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days'`, [workspaceId]);
    return { current: Number(curr?.value ?? 0), previous: Number(prev?.value ?? 0) };
  }

  private getTableForMetric(m: string): string {
    const map: Record<string, string> = { total_revenue: 'ar_invoice', deal_count: 'ar_invoice', avg_deal_size: 'ar_invoice', pipeline_value: 'ar_invoice', ticket_count: 'support_ticket', call_count: 'call_log', lead_score: 'lead_score', campaign_roi: 'marketing_campaign' };
    return map[m] ?? 'ar_invoice';
  }

  private getDateColumnForMetric(m: string): string {
    const map: Record<string, string> = { call_count: '"startTime"' };
    return map[m] ?? '"createdAt"';
  }

  private getAggForMetric(m: string): string {
    const map: Record<string, string> = { total_revenue: 'COALESCE(SUM("totalAmount"),0)::float', avg_deal_size: 'COALESCE(AVG("totalAmount"),0)::float', pipeline_value: 'COALESCE(SUM("balanceDue"),0)::float' };
    return map[m] ?? 'COUNT(*)::int';
  }

  private async safeQuery(sql: string, params: unknown[]): Promise<Record<string, unknown>[]> {
    try { return await this.dataSource.query(sql, params); } catch { return []; }
  }
}
