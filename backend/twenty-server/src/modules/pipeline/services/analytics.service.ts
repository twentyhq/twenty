import { Injectable } from '@nestjs/common';

export interface PipelineHealth {
  stage: string;
  avgDaysInStage: number;
  maxDaysInStage: number;
  dealsStalled: number;
  dealsAtRisk: number;
}

export interface SalesAnalytics {
  totalRevenue: number;
  revenueByStage: Record<string, number>;
  revenueBySource: Record<string, number>;
  revenueByOwner: Record<string, number>;
  winRateByStage: Record<string, number>;
  winRateBySource: Record<string, number>;
  avgDealSize: number;
  medianDealSize: number;
  salesVelocity: number;
  pipelineHealth: PipelineHealth[];
}

export interface OwnerPerformance {
  ownerId: string;
  ownerName: string;
  dealsCreated: number;
  dealsWon: number;
  dealsLost: number;
  totalRevenue: number;
  wonRevenue: number;
  winRate: number;
  avgDealSize: number;
  avgCycleDays: number;
}

@Injectable()
export class AnalyticsService {
  calculatePipelineHealth(
    deals: Array<{ stage: string; daysInStage: number; amount: number | null }>,
  ): PipelineHealth[] {
    const stages = ['NEW', 'SCREENING', 'MEETING', 'PROPOSAL', 'CUSTOMER'];
    const healthByStage = new Map<string, PipelineHealth>();

    for (const stage of stages) {
      healthByStage.set(stage, {
        stage,
        avgDaysInStage: 0,
        maxDaysInStage: 0,
        dealsStalled: 0,
        dealsAtRisk: 0,
      });
    }

    for (const deal of deals) {
      const health = healthByStage.get(deal.stage);
      if (health) {
        health.maxDaysInStage = Math.max(health.maxDaysInStage, deal.daysInStage);
        if (deal.daysInStage > 30) health.dealsAtRisk++;
        if (deal.daysInStage > 60) health.dealsStalled++;
      }
    }

    for (const health of healthByStage.values()) {
      const stageDeals = deals.filter((d) => d.stage === health.stage);
      if (stageDeals.length > 0) {
        const totalDays = stageDeals.reduce((sum, d) => sum + d.daysInStage, 0);
        health.avgDaysInStage = Math.round(totalDays / stageDeals.length);
      }
    }

    return Array.from(healthByStage.values());
  }

  calculateSalesVelocity(
    deals: Array<{ stage: string; closeDate: Date | null; createdAt: Date }>,
  ): number {
    const wonDeals = deals.filter((d) => d.stage === 'WON' && d.closeDate);
    
    if (wonDeals.length === 0) return 0;

    let totalDays = 0;
    for (const deal of wonDeals) {
      if (deal.closeDate) {
        const days = Math.floor(
          (new Date(deal.closeDate).getTime() - new Date(deal.createdAt).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        totalDays += days;
      }
    }

    return Math.round(totalDays / wonDeals.length);
  }

  calculateMedianDealSize(
    deals: Array<{ amount: number | null; stage: string }>,
  ): number {
    const amounts = deals
      .filter((d) => d.amount !== null && d.stage !== 'LOST')
      .map((d) => d.amount as number)
      .sort((a, b) => a - b);

    if (amounts.length === 0) return 0;

    const mid = Math.floor(amounts.length / 2);
    return amounts.length % 2 !== 0
      ? amounts[mid]
      : Math.round((amounts[mid - 1] + amounts[mid]) / 2);
  }

  analyzeOwnerPerformance(
    deals: Array<{
      ownerId: string;
      ownerName: string;
      amount: number | null;
      stage: string;
      closeDate: Date | null;
      createdAt: Date;
    }>,
  ): OwnerPerformance[] {
    const ownerMap = new Map<string, OwnerPerformance>();

    for (const deal of deals) {
      if (!deal.ownerId) continue;

      if (!ownerMap.has(deal.ownerId)) {
        ownerMap.set(deal.ownerId, {
          ownerId: deal.ownerId,
          ownerName: deal.ownerName,
          dealsCreated: 0,
          dealsWon: 0,
          dealsLost: 0,
          totalRevenue: 0,
          wonRevenue: 0,
          winRate: 0,
          avgDealSize: 0,
          avgCycleDays: 0,
        });
      }

      const perf = ownerMap.get(deal.ownerId)!;
      perf.dealsCreated++;

      if (deal.amount) {
        perf.totalRevenue += deal.amount;
      }

      if (deal.stage === 'WON' && deal.amount) {
        perf.dealsWon++;
        perf.wonRevenue += deal.amount;
      }

      if (deal.stage === 'LOST') {
        perf.dealsLost++;
      }
    }

    for (const perf of ownerMap.values()) {
      const closedDeals = perf.dealsWon + perf.dealsLost;
      perf.winRate = closedDeals > 0 ? Math.round((perf.dealsWon / closedDeals) * 100) : 0;
      perf.avgDealSize = perf.dealsWon > 0 ? Math.round(perf.wonRevenue / perf.dealsWon) : 0;
    }

    return Array.from(ownerMap.values());
  }
}
