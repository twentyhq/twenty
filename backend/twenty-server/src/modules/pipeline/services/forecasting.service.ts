import { Injectable } from '@nestjs/common';
import { PipelineService } from 'src/modules/pipeline/services/pipeline.service';

export interface ForecastMetrics {
  totalPipeline: number;
  weightedPipeline: number;
  bestCase: number;
  expectedCase: number;
  worstCase: number;
  dealsCount: number;
  avgDealSize: number;
  winRate: number;
  avgCycleDays: number;
}

export interface ForecastByStage {
  stage: string;
  dealsCount: number;
  totalAmount: number;
  weightedAmount: number;
  probability: number;
  winRate: number;
}

export interface ForecastByOwner {
  ownerId: string;
  ownerName: string;
  totalPipeline: number;
  weightedPipeline: number;
  dealsCount: number;
  winRate: number;
}

@Injectable()
export class ForecastingService {
  constructor(private readonly pipelineService: PipelineService) {}

  calculateForecastMetrics(
    deals: Array<{ amount: number | null; stage: string; closeDate: Date | null }>,
  ): ForecastMetrics {
    let totalPipeline = 0;
    let weightedPipeline = 0;
    let dealsCount = 0;

    for (const deal of deals) {
      if (deal.amount) {
        totalPipeline += deal.amount;
        weightedPipeline += this.pipelineService.calculateWeightedAmount(
          deal.amount,
          deal.stage,
        );
        dealsCount++;
      }
    }

    const avgDealSize = dealsCount > 0 ? totalPipeline / dealsCount : 0;
    const winRate = this.calculateWinRate(deals);

    return {
      totalPipeline,
      weightedPipeline,
      bestCase: totalPipeline,
      expectedCase: weightedPipeline,
      worstCase: Math.round(totalPipeline * 0.3),
      dealsCount,
      avgDealSize,
      winRate,
      avgCycleDays: 45,
    };
  }

  calculateWinRate(
    deals: Array<{ stage: string; amount: number | null }>,
  ): number {
    const wonDeals = deals.filter(
      (d) => d.stage === 'WON' && d.amount !== null,
    );
    const closedDeals = deals.filter(
      (d) => (d.stage === 'WON' || d.stage === 'LOST') && d.amount !== null,
    );

    if (closedDeals.length === 0) return 0;
    return Math.round((wonDeals.length / closedDeals.length) * 100);
  }

  calculateForecastByStage(
    deals: Array<{ stage: string; amount: number | null }>,
  ): ForecastByStage[] {
    const stageMap = new Map<string, ForecastByStage>();
    const stages = ['NEW', 'SCREENING', 'MEETING', 'PROPOSAL', 'CUSTOMER', 'WON', 'LOST'];

    for (const stage of stages) {
      stageMap.set(stage, {
        stage,
        dealsCount: 0,
        totalAmount: 0,
        weightedAmount: 0,
        probability: this.pipelineService.getProbabilityForStage(stage),
        winRate: 0,
      });
    }

    for (const deal of deals) {
      const stageData = stageMap.get(deal.stage);
      if (stageData && deal.amount) {
        stageData.dealsCount++;
        stageData.totalAmount += deal.amount;
        stageData.weightedAmount += this.pipelineService.calculateWeightedAmount(
          deal.amount,
          deal.stage,
        );
      }
    }

    return Array.from(stageMap.values());
  }
}
