import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  DealHealthStatus,
  DealLossAnalysisEntity,
  DealLossIntelligenceEntity,
  LossReason,
} from './deal-loss-intelligence.entity';

@Injectable()
export class DealLossIntelligenceService {
  constructor(
    @InjectRepository(DealLossIntelligenceEntity)
    private readonly intelligenceRepo: Repository<DealLossIntelligenceEntity>,
    @InjectRepository(DealLossAnalysisEntity)
    private readonly analysisRepo: Repository<DealLossAnalysisEntity>,
  ) {}

  async analyzeDeal(
    workspaceId: string,
    deal: {
      id: string;
      name: string;
      amount?: number;
      stage?: string;
      competitorMentions?: string[];
      activitySummary?: string;
      daysSinceLastActivity?: number;
      stakeholderCount?: number;
      priceSensitivityScore?: number;
      decisionTimelineScore?: number;
      competitorMentionsScore?: number;
      expectedRevenue?: number;
    },
  ): Promise<DealLossIntelligenceEntity> {
    const analysis = this.buildAnalysis(deal);
    const intelligence = this.buildIntelligence(workspaceId, deal, analysis);

    const analysisEntity = this.analysisRepo.create({
      workspaceId,
      dealId: deal.id,
      activitySummary: deal.activitySummary ?? null,
      engagementMetrics: {
        stakeholderCount: deal.stakeholderCount ?? 0,
        activityLength: (deal.activitySummary ?? '').length,
        competitorMentions: deal.competitorMentions?.length ?? 0,
      },
      competitorMentionsScore: analysis.competitorMentionsScore,
      priceSensitivityScore: analysis.priceSensitivityScore,
      decisionTimelineScore: analysis.decisionTimelineScore,
      stakeholderInvolvementScore: analysis.stakeholderInvolvementScore,
      isStalled: analysis.isStalled,
      daysSinceLastActivity: analysis.daysSinceLastActivity,
      analyzedAt: new Date(),
    });

    await this.analysisRepo.save(analysisEntity);
    return this.intelligenceRepo.save(intelligence);
  }

  async getDealLoss(workspaceId: string, dealId: string): Promise<DealLossIntelligenceEntity | null> {
    return this.intelligenceRepo.findOne({ where: { workspaceId, dealId } });
  }

  async getAnalysisHistory(workspaceId: string, dealId: string): Promise<DealLossAnalysisEntity[]> {
    return this.analysisRepo.find({
      where: { workspaceId, dealId },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async recomputeLatest(workspaceId: string, dealId: string): Promise<DealLossIntelligenceEntity> {
    const latestAnalysis = await this.analysisRepo.findOne({
      where: { workspaceId, dealId },
      order: { analyzedAt: 'DESC' },
    });

    if (!latestAnalysis) {
      throw new NotFoundException(`Deal analysis ${dealId} not found`);
    }

    const intelligence = this.intelligenceRepo.create({
      workspaceId,
      dealId,
      dealName: dealId,
      lossProbability: this.scoreToProbability(
        latestAnalysis.competitorMentionsScore ?? 0,
        latestAnalysis.priceSensitivityScore ?? 0,
        latestAnalysis.decisionTimelineScore ?? 0,
        latestAnalysis.stakeholderInvolvementScore ?? 0,
        latestAnalysis.daysSinceLastActivity ?? 0,
      ),
      healthStatus: this.getHealthStatus(
        latestAnalysis.competitorMentionsScore ?? 0,
        latestAnalysis.priceSensitivityScore ?? 0,
        latestAnalysis.decisionTimelineScore ?? 0,
        latestAnalysis.stakeholderInvolvementScore ?? 0,
        latestAnalysis.daysSinceLastActivity ?? 0,
      ),
      riskFactors: {
        competitorMentionsScore: latestAnalysis.competitorMentionsScore ?? 0,
        priceSensitivityScore: latestAnalysis.priceSensitivityScore ?? 0,
        decisionTimelineScore: latestAnalysis.decisionTimelineScore ?? 0,
        stakeholderInvolvementScore: latestAnalysis.stakeholderInvolvementScore ?? 0,
        daysSinceLastActivity: latestAnalysis.daysSinceLastActivity ?? 0,
      },
      earlyWarningSigns: this.getEarlyWarningSigns(latestAnalysis),
      recommendations: this.getRecommendations(latestAnalysis),
      predictedLossReason: this.predictLossReason(latestAnalysis),
      expectedRevenue: latestAnalysis.decisionTimelineScore ?? 0,
      computedAt: new Date(),
    });

    return this.intelligenceRepo.save(intelligence);
  }

  async getSummary(workspaceId: string): Promise<{
    dealsAnalyzed: number;
    averageLossProbability: number;
    criticalDeals: number;
    stalledDeals: number;
    byReason: Record<LossReason, number>;
  }> {
    const records = await this.intelligenceRepo.find({ where: { workspaceId } });
    const byReason: Record<LossReason, number> = {
      [LossReason.PRICE]: 0,
      [LossReason.COMPETITOR]: 0,
      [LossReason.TIMING]: 0,
      [LossReason.NO_NEED]: 0,
      [LossReason.SUPPORT]: 0,
      [LossReason.PRODUCT_FIT]: 0,
      [LossReason.UNKNOWN]: 0,
    };

    for (const record of records) {
      if (record.predictedLossReason) {
        byReason[record.predictedLossReason] += 1;
      }
    }

    return {
      dealsAnalyzed: records.length,
      averageLossProbability: records.length
        ? Number((records.reduce((sum, record) => sum + (record.lossProbability ?? 0), 0) / records.length).toFixed(2))
        : 0,
      criticalDeals: records.filter((record) => record.healthStatus === DealHealthStatus.CRITICAL).length,
      stalledDeals: records.filter((record) => record.healthStatus === DealHealthStatus.LOST).length,
      byReason,
    };
  }

  private buildAnalysis(deal: {
    activitySummary?: string;
    competitorMentions?: string[];
    daysSinceLastActivity?: number;
    stakeholderCount?: number;
    priceSensitivityScore?: number;
    decisionTimelineScore?: number;
    competitorMentionsScore?: number;
  }): {
    competitorMentionsScore: number;
    priceSensitivityScore: number;
    decisionTimelineScore: number;
    stakeholderInvolvementScore: number;
    isStalled: boolean;
    daysSinceLastActivity: number;
  } {
    const daysSinceLastActivity = deal.daysSinceLastActivity ?? this.extractDaysSinceLastActivity(deal.activitySummary ?? '');
    const competitorMentionsScore = deal.competitorMentionsScore ?? Math.min(100, (deal.competitorMentions?.length ?? 0) * 20);
    const priceSensitivityScore = deal.priceSensitivityScore ?? this.detectPriceSensitivity(deal.activitySummary ?? '');
    const decisionTimelineScore = deal.decisionTimelineScore ?? this.detectDecisionTimelinePressure(deal.activitySummary ?? '');
    const stakeholderInvolvementScore = Math.min(100, (deal.stakeholderCount ?? 0) * 18);
    const isStalled = daysSinceLastActivity > 14 || decisionTimelineScore < 30;

    return {
      competitorMentionsScore,
      priceSensitivityScore,
      decisionTimelineScore,
      stakeholderInvolvementScore,
      isStalled,
      daysSinceLastActivity,
    };
  }

  private buildIntelligence(
    workspaceId: string,
    deal: {
      id: string;
      name: string;
      amount?: number;
      stage?: string;
      competitorMentions?: string[];
      expectedRevenue?: number;
    },
    analysis: {
      competitorMentionsScore: number;
      priceSensitivityScore: number;
      decisionTimelineScore: number;
      stakeholderInvolvementScore: number;
      isStalled: boolean;
      daysSinceLastActivity: number;
    },
  ): DealLossIntelligenceEntity {
    const lossProbability = this.scoreToProbability(
      analysis.competitorMentionsScore,
      analysis.priceSensitivityScore,
      analysis.decisionTimelineScore,
      analysis.stakeholderInvolvementScore,
      analysis.daysSinceLastActivity,
    );

    return this.intelligenceRepo.create({
      workspaceId,
      dealId: deal.id,
      dealName: deal.name,
      lossProbability,
      healthStatus: this.getHealthStatus(
        analysis.competitorMentionsScore,
        analysis.priceSensitivityScore,
        analysis.decisionTimelineScore,
        analysis.stakeholderInvolvementScore,
        analysis.daysSinceLastActivity,
      ),
      riskFactors: {
        competitorMentionsScore: analysis.competitorMentionsScore,
        priceSensitivityScore: analysis.priceSensitivityScore,
        decisionTimelineScore: analysis.decisionTimelineScore,
        stakeholderInvolvementScore: analysis.stakeholderInvolvementScore,
        daysSinceLastActivity: analysis.daysSinceLastActivity,
      },
      earlyWarningSigns: this.getEarlyWarningSigns({ ...analysis, activitySummary: '' } as DealLossAnalysisEntity),
      recommendations: this.getRecommendations({ ...analysis, activitySummary: '' } as DealLossAnalysisEntity),
      predictedLossReason: this.predictLossReason({ ...analysis, activitySummary: '' } as DealLossAnalysisEntity),
      expectedRevenue: deal.expectedRevenue ?? deal.amount ?? null,
      computedAt: new Date(),
    });
  }

  private scoreToProbability(
    competitorMentionsScore: number,
    priceSensitivityScore: number,
    decisionTimelineScore: number,
    stakeholderInvolvementScore: number,
    daysSinceLastActivity: number,
  ): number {
    const raw =
      competitorMentionsScore * 0.25 +
      priceSensitivityScore * 0.25 +
      (100 - decisionTimelineScore) * 0.2 +
      (100 - stakeholderInvolvementScore) * 0.15 +
      Math.min(daysSinceLastActivity, 30) * 1.0;

    return Math.max(0, Math.min(100, Math.round(raw / 2)));
  }

  private getHealthStatus(
    competitorMentionsScore: number,
    priceSensitivityScore: number,
    decisionTimelineScore: number,
    stakeholderInvolvementScore: number,
    daysSinceLastActivity: number,
  ): DealHealthStatus {
    const probability = this.scoreToProbability(
      competitorMentionsScore,
      priceSensitivityScore,
      decisionTimelineScore,
      stakeholderInvolvementScore,
      daysSinceLastActivity,
    );

    if (probability >= 75) return DealHealthStatus.CRITICAL;
    if (probability >= 50) return DealHealthStatus.AT_RISK;
    return DealHealthStatus.HEALTHY;
  }

  private getEarlyWarningSigns(analysis: DealLossAnalysisEntity): string[] {
    const signs: string[] = [];
    if ((analysis.competitorMentionsScore ?? 0) > 30) signs.push('Competitor mentions rising');
    if ((analysis.priceSensitivityScore ?? 0) > 40) signs.push('Price sensitivity increasing');
    if ((analysis.decisionTimelineScore ?? 0) < 35) signs.push('Decision timeline slipping');
    if ((analysis.stakeholderInvolvementScore ?? 0) < 25) signs.push('Stakeholder coverage weak');
    if ((analysis.daysSinceLastActivity ?? 0) > 14) signs.push('No recent activity');
    if (analysis.isStalled) signs.push('Deal appears stalled');
    return signs;
  }

  private getRecommendations(analysis: DealLossAnalysisEntity): string[] {
    const recommendations: string[] = [];
    if ((analysis.competitorMentionsScore ?? 0) > 30) recommendations.push('Review competitor objections');
    if ((analysis.priceSensitivityScore ?? 0) > 40) recommendations.push('Reframe ROI and value');
    if ((analysis.decisionTimelineScore ?? 0) < 35) recommendations.push('Ask for decision date and next step');
    if ((analysis.stakeholderInvolvementScore ?? 0) < 25) recommendations.push('Map missing stakeholders');
    if ((analysis.daysSinceLastActivity ?? 0) > 14) recommendations.push('Send follow-up within 24 hours');
    if (recommendations.length === 0) recommendations.push('Continue deal momentum and track activity');
    return recommendations;
  }

  private predictLossReason(analysis: DealLossAnalysisEntity): LossReason {
    const competitor = analysis.competitorMentionsScore ?? 0;
    const price = analysis.priceSensitivityScore ?? 0;
    const timeline = analysis.decisionTimelineScore ?? 0;
    const stakeholders = analysis.stakeholderInvolvementScore ?? 0;

    if (price >= competitor && price >= timeline && price >= stakeholders) return LossReason.PRICE;
    if (competitor >= timeline && competitor >= stakeholders) return LossReason.COMPETITOR;
    if (timeline >= stakeholders) return LossReason.TIMING;
    if (stakeholders < 20) return LossReason.NO_NEED;
    return LossReason.UNKNOWN;
  }

  private extractDaysSinceLastActivity(activitySummary: string): number {
    const match = activitySummary.match(/(\d+)\s+days?\s+ago/i);
    return match ? Number(match[1]) : 0;
  }

  private detectPriceSensitivity(activitySummary: string): number {
    const lower = activitySummary.toLowerCase();
    let score = 0;
    if (lower.includes('price')) score += 30;
    if (lower.includes('discount')) score += 20;
    if (lower.includes('budget')) score += 25;
    if (lower.includes('roi')) score += 10;
    return Math.min(100, score);
  }

  private detectDecisionTimelinePressure(activitySummary: string): number {
    const lower = activitySummary.toLowerCase();
    let score = 50;
    if (lower.includes('this month')) score += 25;
    if (lower.includes('this quarter')) score += 20;
    if (lower.includes('urgent')) score += 15;
    if (lower.includes('next year')) score -= 20;
    return Math.max(0, Math.min(100, score));
  }
}
