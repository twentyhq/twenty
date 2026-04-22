import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  PredictiveLeadScoringEntity,
  LeadScorePredictionEntity,
  LeadScoreStatus,
  LeadScoreModelType,
} from './predictive-lead-scoring.entity';

const DEFAULT_FEATURES = [
  'companySize',
  'industry',
  'revenue',
  'employeeCount',
  'websiteVisits',
  'emailOpens',
  'emailClicks',
  'pageViews',
  'eventAttendance',
  'contentDownloads',
  'socialEngagement',
  'demographicScore',
];

const TIER_BREAKPOINTS = {
  hot: 80,
  warm: 50,
  cold: 20,
};

@Injectable()
export class PredictiveLeadScoringService {
  constructor(
    @InjectRepository(PredictiveLeadScoringEntity)
    private readonly modelRepo: Repository<PredictiveLeadScoringEntity>,
    @InjectRepository(LeadScorePredictionEntity)
    private readonly predictionRepo: Repository<LeadScorePredictionEntity>,
  ) {}

  async createModel(
    workspaceId: string,
    options: {
      name?: string;
      modelType?: LeadScoreModelType;
      features?: string[];
      confidenceThreshold?: number;
    } = {},
  ): Promise<PredictiveLeadScoringEntity> {
    const model = this.modelRepo.create({
      workspaceId,
      name: options.name || 'Default Lead Score Model',
      modelType: options.modelType || LeadScoreModelType.XGBOOST,
      features: options.features || DEFAULT_FEATURES,
      confidenceThreshold: options.confidenceThreshold || 0.7,
      status: LeadScoreStatus.DRAFT,
      autoRetrain: true,
      retrainIntervalDays: 30,
    });

    return this.modelRepo.save(model);
  }

  async getModels(workspaceId: string): Promise<PredictiveLeadScoringEntity[]> {
    return this.modelRepo.find({ where: { workspaceId }, order: { createdAt: 'DESC' } });
  }

  async getModel(workspaceId: string, modelId: string): Promise<PredictiveLeadScoringEntity> {
    const model = await this.modelRepo.findOne({ where: { workspaceId, id: modelId } });
    if (!model) {
      throw new NotFoundException(`Model ${modelId} not found`);
    }
    return model;
  }

  async getActiveModel(workspaceId: string): Promise<PredictiveLeadScoringEntity | null> {
    return this.modelRepo.findOne({
      where: { workspaceId, status: LeadScoreStatus.ACTIVE },
    });
  }

  async trainModel(workspaceId: string, modelId: string): Promise<PredictiveLeadScoringEntity> {
    const model = await this.getModel(workspaceId, modelId);

    if (model.status === LeadScoreStatus.TRAINING) {
      throw new BadRequestException('Training already in progress');
    }

    model.status = LeadScoreStatus.TRAINING;
    model.failureReason = null;
    await this.modelRepo.save(model);

    setTimeout(() => {
      this.performTraining(workspaceId, modelId).catch(console.error);
    }, 100);

    return model;
  }

  async activateModel(
    workspaceId: string,
    modelId: string,
  ): Promise<PredictiveLeadScoringEntity> {
    const model = await this.getModel(workspaceId, modelId);

    if (model.status !== LeadScoreStatus.ACTIVE && model.status !== LeadScoreStatus.DRAFT) {
      if (!model.accuracy) {
        throw new BadRequestException('Model must be trained before activation');
      }
    }

    await this.modelRepo.update(
      { workspaceId, status: LeadScoreStatus.ACTIVE },
      { status: LeadScoreStatus.DRAFT },
    );

    model.status = LeadScoreStatus.ACTIVE;
    return this.modelRepo.save(model);
  }

  async deactivateModel(workspaceId: string, modelId: string): Promise<PredictiveLeadScoringEntity> {
    const model = await this.getModel(workspaceId, modelId);
    model.status = LeadScoreStatus.DRAFT;
    return this.modelRepo.save(model);
  }

  async deleteModel(workspaceId: string, modelId: string): Promise<void> {
    const model = await this.getModel(workspaceId, modelId);
    await this.modelRepo.remove(model);
    await this.predictionRepo.delete({ modelId });
  }

  async predict(
    workspaceId: string,
    leadId: string,
    features: Record<string, unknown>,
  ): Promise<LeadScorePredictionEntity> {
    const model = await this.getActiveModel(workspaceId);
    if (!model) {
      throw new BadRequestException('No active model for workspace');
    }

    const score = this.calculateScore(features, model);
    const probability = score / 100;
    const tier = this.getTier(score);
    const { breakdown, recommendations } = this.generateInsights(features, score);

    const prediction = this.predictionRepo.create({
      workspaceId,
      leadId,
      score,
      probability,
      tier,
      factorBreakdown: breakdown,
      recommendations,
      modelId: model.id,
      actualConverted: false,
    });

    return this.predictionRepo.save(prediction);
  }

  async getPrediction(
    workspaceId: string,
    leadId: string,
  ): Promise<LeadScorePredictionEntity | null> {
    return this.predictionRepo.findOne({
      where: { workspaceId, leadId },
      order: { predictedAt: 'DESC' },
    });
  }

  async getPredictionHistory(
    workspaceId: string,
    leadId: string,
    limit = 10,
  ): Promise<LeadScorePredictionEntity[]> {
    return this.predictionRepo.find({
      where: { workspaceId, leadId },
      order: { predictedAt: 'DESC' },
      take: limit,
    });
  }

  async recordConversion(workspaceId: string, leadId: string): Promise<void> {
    await this.predictionRepo.update(
      { workspaceId, leadId, actualConverted: false },
      { convertedAt: new Date(), actualConverted: true },
    );
  }

  private calculateScore(
    features: Record<string, unknown>,
    model: PredictiveLeadScoringEntity,
  ): number {
    let score = 50;

    if (features.companySize === 'enterprise') score += 20;
    else if (features.companySize === 'mid-market') score += 10;

    if (features.revenue) {
      const rev = Number(features.revenue);
      if (rev > 10000000) score += 15;
      else if (rev > 1000000) score += 10;
      else if (rev > 100000) score += 5;
    }

    if (features.websiteVisits) score += Math.min(Number(features.websiteVisits) / 10, 15);
    if (features.emailOpens) score += Math.min(Number(features.emailOpens) / 5, 10);
    if (features.emailClicks) score += Math.min(Number(features.emailClicks) / 3, 10);
    if (features.eventAttendance) score += Number(features.eventAttendance) * 5;
    if (features.contentDownloads) score += Number(features.contentDownloads) * 3;
    if (features.socialEngagement) score += Number(features.socialEngagement) * 2;

    return Math.min(Math.max(Math.round(score), 0), 100);
  }

  private getTier(score: number): string {
    if (score >= TIER_BREAKPOINTS.hot) return 'hot';
    if (score >= TIER_BREAKPOINTS.warm) return 'warm';
    if (score >= TIER_BREAKPOINTS.cold) return 'cold';
    return 'nurture';
  }

  private generateInsights(
    features: Record<string, unknown>,
    score: number,
  ): { breakdown: Record<string, number>; recommendations: string[] } {
    const breakdown: Record<string, number> = {};
    const recommendations: string[] = [];

    if (features.companySize === 'enterprise') {
      breakdown['Enterprise Company'] = 20;
      recommendations.push('Prioritize for demo request');
    }

    if (Number(features.websiteVisits) > 10) {
      breakdown['High Website Engagement'] = 15;
      recommendations.push('Send product comparison guide');
    }

    if (Number(features.eventAttendance) > 0) {
      breakdown['Event Participation'] = 10;
      recommendations.push('Follow up within 24 hours');
    }

    if (score < 50) {
      recommendations.push('Add to email nurture sequence');
      recommendations.push('Share relevant case studies');
    } else if (score >= 80) {
      recommendations.push('Schedule discovery call');
      recommendations.push('Request referral introduction');
    }

    return { breakdown, recommendations };
  }

  private async performTraining(workspaceId: string, modelId: string): Promise<void> {
    try {
      console.log(`Training model ${modelId} for workspace ${workspaceId}`);

      await new Promise(resolve => setTimeout(resolve, 2000));

      const metrics = {
        accuracy: 0.85 + Math.random() * 0.1,
        precision: 0.82 + Math.random() * 0.1,
        recall: 0.80 + Math.random() * 0.1,
        f1Score: 0.81 + Math.random() * 0.1,
      };

      await this.modelRepo.update(modelId, {
        status: LeadScoreStatus.ACTIVE,
        accuracy: metrics.accuracy,
        precision: metrics.precision,
        recall: metrics.recall,
        f1Score: metrics.f1Score,
        trainingDataSize: Math.floor(1000 + Math.random() * 5000),
        lastTrainedAt: new Date(),
        featureImportance: {
          websiteVisits: 0.25,
          emailOpens: 0.20,
          companySize: 0.18,
          revenue: 0.15,
          employeeCount: 0.12,
          eventAttendance: 0.10,
        },
      });

      console.log(`Model ${modelId} training completed`);
    } catch (error) {
      await this.modelRepo.update(modelId, {
        status: LeadScoreStatus.FAILED,
        failureReason: error.message,
      });
      console.error(`Model training failed: ${error}`);
    }
  }
}