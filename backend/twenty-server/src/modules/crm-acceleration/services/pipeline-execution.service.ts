import { Injectable } from '@nestjs/common';

interface PipelineDealInput {
  id: string;
  pipelineId: string;
  stage: string;
  amount: number;
  createdAt: string | Date;
  stageChangedAt?: string | Date | null;
  closedAt?: string | Date | null;
  status?: 'OPEN' | 'WON' | 'LOST';
}

interface PipelineDefinitionInput {
  id: string;
  name: string;
  stages: string[];
}

interface VelocityRequestInput {
  deals: PipelineDealInput[];
  stageOrder: string[];
}

interface MultiPipelineRequestInput {
  deals: PipelineDealInput[];
  pipelines: PipelineDefinitionInput[];
}

interface RottingRequestInput {
  deals: PipelineDealInput[];
  thresholdByStage?: Record<string, number>;
}

type DealWarningSeverity = 'warning' | 'critical';

@Injectable()
export class PipelineExecutionService {
  private readonly defaultStageThresholdByDays: Record<string, number> = {
    NEW: 7,
    SCREENING: 14,
    MEETING: 10,
    PROPOSAL: 14,
    NEGOTIATION: 12,
    CUSTOMER: 7,
  };

  private toDate(value: string | Date | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    return value instanceof Date ? value : new Date(value);
  }

  private getDaysBetween(startDate: Date | null, endDate: Date | null): number {
    if (!startDate || !endDate) {
      return 0;
    }

    return Math.max(
      0,
      Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
    );
  }

  private getDealDaysInStage(deal: PipelineDealInput): number {
    const stageChangedAt = this.toDate(deal.stageChangedAt) ?? this.toDate(deal.createdAt);
    const referenceDate = deal.status === 'OPEN' ? new Date() : this.toDate(deal.closedAt) ?? new Date();

    return this.getDaysBetween(stageChangedAt, referenceDate);
  }

  getDealRotationWarnings(input: RottingRequestInput) {
    const thresholdByStage = {
      ...this.defaultStageThresholdByDays,
      ...(input.thresholdByStage ?? {}),
    };

    const warnings = input.deals
      .filter((deal) => deal.status !== 'WON')
      .map((deal) => {
        const threshold = thresholdByStage[deal.stage] ?? 10;
        const daysInStage = this.getDealDaysInStage(deal);
        const overThresholdDays = Math.max(0, daysInStage - threshold);

        if (overThresholdDays <= 0) {
          return null;
        }

        const severity: DealWarningSeverity =
          daysInStage >= threshold * 2 ? 'critical' : 'warning';

        return {
          dealId: deal.id,
          pipelineId: deal.pipelineId,
          stage: deal.stage,
          daysInStage,
          thresholdDays: threshold,
          overThresholdDays,
          severity,
          color: severity === 'critical' ? 'red' : 'yellow',
        };
      })
      .filter((warning): warning is NonNullable<typeof warning> => warning !== null);

    return {
      totalDealsAnalyzed: input.deals.length,
      dealsWithWarning: warnings.length,
      warnings,
    };
  }

  getVelocityMetrics(input: VelocityRequestInput) {
    const stageMetrics = input.stageOrder.map((stage, index) => {
      const dealsAtStage = input.deals.filter((deal) => deal.stage === stage);
      const avgDaysInStage =
        dealsAtStage.length === 0
          ? 0
          : Math.round(
              dealsAtStage.reduce(
                (accumulator, deal) => accumulator + this.getDealDaysInStage(deal),
                0,
              ) / dealsAtStage.length,
            );

      const nextStage = input.stageOrder[index + 1];
      const nextStageCount = nextStage
        ? input.deals.filter((deal) => deal.stage === nextStage).length
        : 0;

      const conversionRateToNextStage =
        nextStage && dealsAtStage.length > 0
          ? Math.round((nextStageCount / dealsAtStage.length) * 100)
          : null;

      return {
        stage,
        deals: dealsAtStage.length,
        avgDaysInStage,
        conversionRateToNextStage,
      };
    });

    const closedDeals = input.deals.filter((deal) => deal.status === 'WON');
    const averageCycleDays =
      closedDeals.length === 0
        ? 0
        : Math.round(
            closedDeals.reduce((accumulator, deal) => {
              const createdAt = this.toDate(deal.createdAt);
              const closedAt = this.toDate(deal.closedAt) ?? new Date();

              return accumulator + this.getDaysBetween(createdAt, closedAt);
            }, 0) / closedDeals.length,
          );

    const totalRevenue = input.deals.reduce(
      (accumulator, deal) => accumulator + (deal.amount || 0),
      0,
    );

    return {
      stageMetrics,
      averageCycleDays,
      averageDealSize:
        input.deals.length > 0 ? Math.round(totalRevenue / input.deals.length) : 0,
      totalRevenue,
    };
  }

  getMultiPipelineSupportSummary(input: MultiPipelineRequestInput) {
    const byPipeline = input.pipelines.map((pipeline) => {
      const deals = input.deals.filter((deal) => deal.pipelineId === pipeline.id);
      const wonDeals = deals.filter((deal) => deal.status === 'WON').length;
      const lostDeals = deals.filter((deal) => deal.status === 'LOST').length;
      const closedDeals = wonDeals + lostDeals;
      const totalValue = deals.reduce(
        (accumulator, deal) => accumulator + (deal.amount || 0),
        0,
      );

      return {
        pipelineId: pipeline.id,
        pipelineName: pipeline.name,
        stages: pipeline.stages,
        deals: deals.length,
        totalValue,
        winRate:
          closedDeals > 0 ? Math.round((wonDeals / closedDeals) * 100) : 0,
      };
    });

    return {
      totalPipelines: input.pipelines.length,
      totalDeals: input.deals.length,
      byPipeline,
    };
  }
}
