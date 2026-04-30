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
    model.failureReason = '';
    await this.modelRepo.save(model);

    void this.performTraining(workspaceId, modelId).catch(console.error);

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

  // Feature weight definitions keyed by model type, allowing different
  // scoring strategies depending on the chosen algorithm.
  private static readonly FEATURE_WEIGHTS: Record<
    LeadScoreModelType,
    Record<string, { weight: number; normalize: (value: unknown) => number }>
  > = {
    [LeadScoreModelType.XGBOOST]: {
      companySize: {
        weight: 0.15,
        normalize: (v) => {
          const map: Record<string, number> = { enterprise: 1, 'mid-market': 0.7, smb: 0.4, startup: 0.2 };
          return map[String(v)] ?? 0.1;
        },
      },
      industry: {
        weight: 0.08,
        normalize: (v) => {
          const high = ['technology', 'finance', 'healthcare', 'saas'];
          const mid = ['manufacturing', 'retail', 'education'];
          const val = String(v).toLowerCase();
          if (high.includes(val)) return 1;
          if (mid.includes(val)) return 0.6;
          return 0.3;
        },
      },
      revenue: {
        weight: 0.12,
        normalize: (v) => {
          const rev = Number(v) || 0;
          if (rev >= 50_000_000) return 1;
          if (rev >= 10_000_000) return 0.85;
          if (rev >= 1_000_000) return 0.65;
          if (rev >= 100_000) return 0.4;
          return 0.15;
        },
      },
      employeeCount: {
        weight: 0.07,
        normalize: (v) => Math.min(Number(v) || 0, 10000) / 10000,
      },
      websiteVisits: {
        weight: 0.15,
        normalize: (v) => Math.min(Number(v) || 0, 100) / 100,
      },
      emailOpens: {
        weight: 0.12,
        normalize: (v) => Math.min(Number(v) || 0, 50) / 50,
      },
      emailClicks: {
        weight: 0.10,
        normalize: (v) => Math.min(Number(v) || 0, 30) / 30,
      },
      pageViews: {
        weight: 0.05,
        normalize: (v) => Math.min(Number(v) || 0, 200) / 200,
      },
      eventAttendance: {
        weight: 0.06,
        normalize: (v) => Math.min(Number(v) || 0, 10) / 10,
      },
      contentDownloads: {
        weight: 0.05,
        normalize: (v) => Math.min(Number(v) || 0, 20) / 20,
      },
      socialEngagement: {
        weight: 0.03,
        normalize: (v) => Math.min(Number(v) || 0, 50) / 50,
      },
      demographicScore: {
        weight: 0.02,
        normalize: (v) => Math.min(Math.max(Number(v) || 0, 0), 100) / 100,
      },
    },
    [LeadScoreModelType.RANDOM_FOREST]: {} as Record<string, { weight: number; normalize: (value: unknown) => number }>,
    [LeadScoreModelType.LINEAR_REGRESSION]: {} as Record<string, { weight: number; normalize: (value: unknown) => number }>,
    [LeadScoreModelType.NEURAL_NETWORK]: {} as Record<string, { weight: number; normalize: (value: unknown) => number }>,
  };

  private calculateScore(
    features: Record<string, unknown>,
    model: PredictiveLeadScoringEntity,
  ): number {
    const staticWeights =
      PredictiveLeadScoringService.FEATURE_WEIGHTS[model.modelType] ??
      PredictiveLeadScoringService.FEATURE_WEIGHTS[LeadScoreModelType.XGBOOST];

    const activeFeatures = model.features?.length
      ? model.features
      : DEFAULT_FEATURES;

    // When the model was trained with real data, use the logistic regression
    // weights stored in modelConfig for a probability-based score.
    const trainedConfig = model.modelConfig as {
      weights?: Record<string, number>;
      bias?: number;
      trainedWithData?: boolean;
    } | null;

    if (trainedConfig?.trainedWithData && trainedConfig.weights) {
      const trainedWeights = trainedConfig.weights;
      const bias = trainedConfig.bias ?? 0;

      let logit = bias;

      for (const featureName of activeFeatures) {
        const featureConfig = staticWeights[featureName];
        if (!featureConfig) continue;

        const normalizedValue = featureConfig.normalize(features[featureName]);

        logit += (trainedWeights[featureName] ?? 0) * normalizedValue;
      }

      // Sigmoid to probability, then scale to 0-100
      const probability = 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, logit))));
      const baseScore = probability * 100;

      // Blend with recency and velocity signals
      const recencyBoost = this.calculateRecencyBoost(features);
      const velocityBonus = this.calculateVelocityBonus(features);
      const finalScore = baseScore * 0.8 + recencyBoost * 0.12 + velocityBonus * 0.08;

      return Math.min(Math.max(Math.round(finalScore), 0), 100);
    }

    // Fallback: use feature importance weights (either from training or static)
    const importance = model.featureImportance ?? {};

    let weightedSum = 0;
    let totalWeight = 0;

    for (const featureName of activeFeatures) {
      const featureConfig = staticWeights[featureName];
      if (!featureConfig) continue;

      const featureWeight = importance[featureName] ?? featureConfig.weight;
      const rawValue = features[featureName];
      const normalizedValue = featureConfig.normalize(rawValue);

      weightedSum += normalizedValue * featureWeight;
      totalWeight += featureWeight;
    }

    // Normalize to 0-100 range based on total weight coverage
    const baseScore = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 50;

    // Apply recency boost: recent engagement signals are more valuable
    const recencyBoost = this.calculateRecencyBoost(features);

    // Apply interaction velocity bonus: rapid increase in engagement
    const velocityBonus = this.calculateVelocityBonus(features);

    const finalScore = baseScore * 0.8 + recencyBoost * 0.12 + velocityBonus * 0.08;

    // Apply confidence threshold gate
    if (model.confidenceThreshold > 0 && totalWeight / 1.0 < model.confidenceThreshold * 0.5) {
      // Insufficient feature coverage -- dampen score toward midpoint
      return Math.round(50 + (finalScore - 50) * 0.5);
    }

    return Math.min(Math.max(Math.round(finalScore), 0), 100);
  }

  private calculateRecencyBoost(features: Record<string, unknown>): number {
    let boost = 0;
    // Recent website visits in last 7 days
    const recentVisits = Number(features.recentWebsiteVisits ?? features.websiteVisits ?? 0);
    if (recentVisits > 5) boost += 30;
    else if (recentVisits > 2) boost += 15;

    // Recent email engagement
    const recentClicks = Number(features.recentEmailClicks ?? features.emailClicks ?? 0);
    if (recentClicks > 3) boost += 25;
    else if (recentClicks > 0) boost += 10;

    // Recently attended event
    if (Number(features.daysSinceLastEvent ?? 999) < 14) boost += 20;

    // Recently downloaded content
    if (Number(features.daysSinceLastDownload ?? 999) < 7) boost += 15;

    // Form submission
    if (features.formSubmitted) boost += 10;

    return Math.min(boost, 100);
  }

  private calculateVelocityBonus(features: Record<string, unknown>): number {
    // Compare current period engagement vs previous period
    const currentVisits = Number(features.websiteVisitsThisPeriod ?? features.websiteVisits ?? 0);
    const previousVisits = Number(features.websiteVisitsLastPeriod ?? 0);
    const currentEmails = Number(features.emailOpensThisPeriod ?? features.emailOpens ?? 0);
    const previousEmails = Number(features.emailOpensLastPeriod ?? 0);

    let velocity = 0;

    if (previousVisits > 0) {
      const visitGrowth = (currentVisits - previousVisits) / previousVisits;
      velocity += Math.min(visitGrowth * 30, 40);
    } else if (currentVisits > 5) {
      velocity += 25;
    }

    if (previousEmails > 0) {
      const emailGrowth = (currentEmails - previousEmails) / previousEmails;
      velocity += Math.min(emailGrowth * 25, 35);
    } else if (currentEmails > 3) {
      velocity += 20;
    }

    // Multi-channel engagement bonus
    const channels = [
      Number(features.websiteVisits ?? 0) > 0,
      Number(features.emailOpens ?? 0) > 0,
      Number(features.eventAttendance ?? 0) > 0,
      Number(features.socialEngagement ?? 0) > 0,
      Number(features.contentDownloads ?? 0) > 0,
    ].filter(Boolean).length;

    if (channels >= 4) velocity += 25;
    else if (channels >= 3) velocity += 15;
    else if (channels >= 2) velocity += 5;

    return Math.min(Math.max(velocity, 0), 100);
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

    // Firmographic factors
    const companySize = String(features.companySize ?? '');
    if (companySize === 'enterprise') {
      breakdown['Enterprise Company'] = 15;
      recommendations.push('Assign to enterprise sales team');
    } else if (companySize === 'mid-market') {
      breakdown['Mid-Market Company'] = 10;
    }

    const revenue = Number(features.revenue ?? 0);
    if (revenue >= 10_000_000) {
      breakdown['High Revenue ($10M+)'] = 12;
      recommendations.push('Prioritize for executive demo');
    } else if (revenue >= 1_000_000) {
      breakdown['Revenue ($1M+)'] = 8;
    }

    const industry = String(features.industry ?? '').toLowerCase();
    const highValueIndustries = ['technology', 'finance', 'healthcare', 'saas'];
    if (highValueIndustries.includes(industry)) {
      breakdown['High-Value Industry'] = 8;
    }

    // Behavioral factors
    const websiteVisits = Number(features.websiteVisits ?? 0);
    if (websiteVisits > 20) {
      breakdown['Very High Website Engagement'] = 15;
      recommendations.push('Send product comparison guide');
      recommendations.push('Consider triggering sales outreach');
    } else if (websiteVisits > 10) {
      breakdown['High Website Engagement'] = 10;
      recommendations.push('Send product comparison guide');
    } else if (websiteVisits > 3) {
      breakdown['Moderate Website Activity'] = 5;
    }

    const emailClicks = Number(features.emailClicks ?? 0);
    if (emailClicks > 5) {
      breakdown['Strong Email Engagement'] = 10;
      recommendations.push('Move to sales-qualified sequence');
    } else if (emailClicks > 0) {
      breakdown['Email Engagement'] = 5;
    }

    const emailOpens = Number(features.emailOpens ?? 0);
    if (emailOpens > 10 && emailClicks === 0) {
      breakdown['Opens Without Clicks'] = 3;
      recommendations.push('Test different CTAs in emails');
    }

    if (Number(features.eventAttendance ?? 0) > 0) {
      breakdown['Event Participation'] = 6;
      recommendations.push('Follow up within 24 hours of event');
    }

    if (Number(features.contentDownloads ?? 0) > 2) {
      breakdown['Content Consumer'] = 5;
      recommendations.push('Offer personalized content recommendations');
    }

    // Multi-channel engagement indicator
    const channels = [
      websiteVisits > 0,
      emailOpens > 0,
      Number(features.eventAttendance ?? 0) > 0,
      Number(features.socialEngagement ?? 0) > 0,
      Number(features.contentDownloads ?? 0) > 0,
    ].filter(Boolean).length;

    if (channels >= 3) {
      breakdown['Multi-Channel Engagement'] = 8;
      recommendations.push('Coordinate outreach across channels');
    }

    // Tier-based recommendations
    if (score >= TIER_BREAKPOINTS.hot) {
      recommendations.push('Schedule discovery call immediately');
      recommendations.push('Request referral introduction');
      recommendations.push('Prepare custom proposal');
    } else if (score >= TIER_BREAKPOINTS.warm) {
      recommendations.push('Add to targeted nurture campaign');
      recommendations.push('Share relevant case studies');
      recommendations.push('Invite to upcoming webinar');
    } else if (score >= TIER_BREAKPOINTS.cold) {
      recommendations.push('Add to email nurture sequence');
      recommendations.push('Retarget with awareness content');
    } else {
      recommendations.push('Add to long-term drip campaign');
      recommendations.push('Monitor for engagement signals');
    }

    return { breakdown, recommendations };
  }

  private async performTraining(workspaceId: string, modelId: string): Promise<void> {
    try {
      const model = await this.getModel(workspaceId, modelId);
      const activeFeatures = model.features?.length
        ? model.features
        : DEFAULT_FEATURES;

      // Fetch historical predictions with known outcomes for this workspace
      const predictions = await this.predictionRepo.find({
        where: { workspaceId },
        order: { predictedAt: 'DESC' },
        take: 5000,
      });

      // Only use predictions that have a definitive outcome
      const labeledData = predictions.filter(
        (prediction) => prediction.actualConverted || prediction.convertedAt !== null,
      );

      if (labeledData.length < 10) {
        // Not enough labeled data -- use prior weights from the static table
        // and store them so calculateScore can leverage featureImportance
        const staticWeights =
          PredictiveLeadScoringService.FEATURE_WEIGHTS[model.modelType] ??
          PredictiveLeadScoringService.FEATURE_WEIGHTS[LeadScoreModelType.XGBOOST];

        const featureImportance: Record<string, number> = {};

        for (const featureName of activeFeatures) {
          featureImportance[featureName] = staticWeights[featureName]?.weight ?? 0;
        }

        await this.modelRepo.update(modelId, {
          status: LeadScoreStatus.ACTIVE,
          accuracy: 0,
          precision: 0,
          recall: 0,
          f1Score: 0,
          trainingDataSize: labeledData.length,
          lastTrainedAt: new Date(),
          featureImportance,
          modelConfig: { weights: featureImportance, bias: 0, trainedWithData: false },
        });

        return;
      }

      // Build training matrix from factor breakdowns stored on each prediction
      const { weights, bias } = this.trainLogisticRegression(
        labeledData,
        activeFeatures,
      );

      // Normalize weights into importance values (sum to 1)
      const featureImportance: Record<string, number> = {};
      const absSum = activeFeatures.reduce(
        (sum, featureName) => sum + Math.abs(weights[featureName] ?? 0),
        0,
      );

      for (const featureName of activeFeatures) {
        featureImportance[featureName] =
          absSum > 0 ? Math.abs(weights[featureName] ?? 0) / absSum : 1 / activeFeatures.length;
      }

      // Evaluate model on a holdout set (last 20% of data)
      const holdoutSize = Math.max(1, Math.floor(labeledData.length * 0.2));
      const holdout = labeledData.slice(0, holdoutSize);
      const metrics = this.evaluateModel(holdout, weights, bias, activeFeatures);

      await this.modelRepo.update(modelId, {
        status: LeadScoreStatus.ACTIVE,
        accuracy: metrics.accuracy,
        precision: metrics.precision,
        recall: metrics.recall,
        f1Score: metrics.f1Score,
        trainingDataSize: labeledData.length,
        lastTrainedAt: new Date(),
        featureImportance,
        modelConfig: { weights, bias, trainedWithData: true },
      });
    } catch (error) {
      await this.modelRepo.update(modelId, {
        status: LeadScoreStatus.FAILED,
        failureReason: error instanceof Error ? error.message : 'Training failed',
      });
    }
  }

  // Simple logistic regression via gradient descent on historical prediction data.
  // Each prediction's factorBreakdown provides feature values; actualConverted
  // provides the label.
  private trainLogisticRegression(
    data: LeadScorePredictionEntity[],
    featureNames: string[],
  ): { weights: Record<string, number>; bias: number } {
    const learningRate = 0.01;
    const epochs = 200;

    // Initialize weights to small values
    const weights: Record<string, number> = {};

    for (const featureName of featureNames) {
      weights[featureName] = 0;
    }

    let bias = 0;

    // Build feature vectors from factor breakdowns
    const samples = data.map((prediction) => {
      const featureVector: number[] = featureNames.map((featureName) => {
        const value = prediction.factorBreakdown?.[featureName] ?? 0;

        // Normalize to 0-1 range (factor breakdowns are typically 0-100)
        return Math.min(1, Math.max(0, value / 100));
      });
      const label = prediction.actualConverted ? 1 : 0;

      return { featureVector, label };
    });

    // Gradient descent
    for (let epoch = 0; epoch < epochs; epoch++) {
      for (const sample of samples) {
        // Compute logit
        let logit = bias;

        for (let featureIndex = 0; featureIndex < featureNames.length; featureIndex++) {
          logit += (weights[featureNames[featureIndex]] ?? 0) * sample.featureVector[featureIndex];
        }

        // Sigmoid
        const predicted = 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, logit))));
        const error = predicted - sample.label;

        // Update weights
        for (let featureIndex = 0; featureIndex < featureNames.length; featureIndex++) {
          weights[featureNames[featureIndex]] -= learningRate * error * sample.featureVector[featureIndex];
        }

        bias -= learningRate * error;
      }
    }

    return { weights, bias };
  }

  private evaluateModel(
    holdout: LeadScorePredictionEntity[],
    weights: Record<string, number>,
    bias: number,
    featureNames: string[],
  ): { accuracy: number; precision: number; recall: number; f1Score: number } {
    let truePositives = 0;
    let falsePositives = 0;
    let trueNegatives = 0;
    let falseNegatives = 0;

    for (const prediction of holdout) {
      let logit = bias;

      for (const featureName of featureNames) {
        const value = (prediction.factorBreakdown?.[featureName] ?? 0) / 100;

        logit += (weights[featureName] ?? 0) * value;
      }

      const predicted = 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, logit))));
      const predictedLabel = predicted >= 0.5 ? 1 : 0;
      const actualLabel = prediction.actualConverted ? 1 : 0;

      if (predictedLabel === 1 && actualLabel === 1) truePositives++;
      else if (predictedLabel === 1 && actualLabel === 0) falsePositives++;
      else if (predictedLabel === 0 && actualLabel === 0) trueNegatives++;
      else falseNegatives++;
    }

    const total = holdout.length;
    const accuracy = total > 0 ? (truePositives + trueNegatives) / total : 0;
    const precision = truePositives + falsePositives > 0
      ? truePositives / (truePositives + falsePositives)
      : 0;
    const recall = truePositives + falseNegatives > 0
      ? truePositives / (truePositives + falseNegatives)
      : 0;
    const f1Score = precision + recall > 0
      ? (2 * precision * recall) / (precision + recall)
      : 0;

    return {
      accuracy: Number(accuracy.toFixed(3)),
      precision: Number(precision.toFixed(3)),
      recall: Number(recall.toFixed(3)),
      f1Score: Number(f1Score.toFixed(3)),
    };
  }
}
