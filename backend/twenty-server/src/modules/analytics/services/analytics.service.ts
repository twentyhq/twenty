import { Injectable, Logger } from '@nestjs/common';

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'funnel';
  title: string;
  config: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number };
}

export interface SalesAnalytics {
  revenue: number;
  revenueChange: number;
  deals: number;
  dealsChange: number;
  avgDealSize: number;
  winRate: number;
  pipelineValue: number;
  forecast: number;
}

export interface CohortData {
  cohort: string;
  period: number;
  value: number;
}

export interface ConversionFunnel {
  stage: string;
  count: number;
  conversionRate: number;
  dropOff: number;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  async getSalesDashboard(workspaceId: string): Promise<SalesAnalytics> {
    return {
      revenue: 50000000,
      revenueChange: 15.5,
      deals: 45,
      dealsChange: 8.2,
      avgDealSize: 1111111,
      winRate: 32,
      pipelineValue: 150000000,
      forecast: 85000000,
    };
  }

  async getRevenueByPeriod(
    workspaceId: string,
    period: 'day' | 'week' | 'month' | 'quarter',
  ): Promise<Array<{ date: string; revenue: number }>> {
    const data: Array<{ date: string; revenue: number }> = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      
      data.push({
        date: date.toISOString().slice(0, 7),
        revenue: Math.floor(Math.random() * 10000000) + 2000000,
      });
    }

    return data;
  }

  async getConversionFunnel(workspaceId: string): Promise<ConversionFunnel[]> {
    const stages = [
      { stage: 'Leads', count: 1000 },
      { stage: 'Qualificados', count: 450 },
      { stage: 'Reunión', count: 280 },
      { stage: 'Propuesta', count: 150 },
      { stage: 'Negociación', count: 80 },
      { stage: 'Cerrado', count: 45 },
    ];

    return stages.map((stage, index) => {
      const prevCount = index === 0 ? stage.count : stages[index - 1].count;
      const conversionRate = prevCount > 0 ? (stage.count / prevCount) * 100 : 0;
      const dropOff = 100 - conversionRate;

      return {
        stage: stage.stage,
        count: stage.count,
        conversionRate: Math.round(conversionRate),
        dropOff: Math.round(dropOff),
      };
    });
  }

  async getCohortAnalysis(
    workspaceId: string,
    metric: 'revenue' | 'deals' | 'retention',
  ): Promise<CohortData[]> {
    const cohorts = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const data: CohortData[] = [];

    for (let i = 0; i < cohorts.length; i++) {
      for (let j = 0; j < 6 - i; j++) {
        data.push({
          cohort: cohorts[i],
          period: j,
          value: Math.floor(Math.random() * 100) + 10,
        });
      }
    }

    return data;
  }

  async getOwnerPerformance(
    workspaceId: string,
  ): Promise<Array<{
    ownerId: string;
    ownerName: string;
    revenue: number;
    deals: number;
    winRate: number;
    avgCycle: number;
  }>> {
    return [
      { ownerId: '1', ownerName: 'Juan Pérez', revenue: 15000000, deals: 12, winRate: 45, avgCycle: 35 },
      { ownerId: '2', ownerName: 'María García', revenue: 12000000, deals: 10, winRate: 38, avgCycle: 42 },
      { ownerId: '3', ownerName: 'Carlos López', revenue: 8500000, deals: 7, winRate: 28, avgCycle: 55 },
      { ownerId: '4', ownerName: 'Ana Martínez', revenue: 7000000, deals: 6, winRate: 32, avgCycle: 48 },
    ];
  }

  async getRevenueBySource(
    workspaceId: string,
  ): Promise<Array<{ source: string; revenue: number; percentage: number }>> {
    const sources = [
      { source: 'Sitio Web', revenue: 20000000 },
      { source: 'Referidos', revenue: 12000000 },
      { source: 'Redes Sociales', revenue: 8000000 },
      { source: 'Eventos', revenue: 5000000 },
      { source: 'Otros', revenue: 3000000 },
    ];

    const total = sources.reduce((sum, s) => sum + s.revenue, 0);

    return sources.map((s) => ({
      ...s,
      percentage: Math.round((s.revenue / total) * 100),
    }));
  }

  async checkAnomalies(workspaceId: string): Promise<Array<{
    metric: string;
    current: number;
    expected: number;
    deviation: number;
    severity: 'low' | 'medium' | 'high';
  }>> {
    const checks = [
      { metric: 'Win Rate', current: 25, expected: 35, deviation: -28.5 },
      { metric: 'Avg Deal Size', current: 800000, expected: 1000000, deviation: -20 },
      { metric: 'Pipeline Value', current: 100000000, expected: 120000000, deviation: -16.6 },
    ];

    return checks.map((check) => ({
      ...check,
      severity: Math.abs(check.deviation) > 25 ? 'high' : Math.abs(check.deviation) > 15 ? 'medium' : 'low',
    }));
  }
}
