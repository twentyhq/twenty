import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  ProductUsageEventEntity, PQLScoreEntity, TrialConversionEntity, ProductAdoptionEntity,
  PQLGrade, TrialStatus, AdoptionStage,
} from './plg-intelligence.entity';

@Injectable()
export class PLGIntelligenceService {
  private readonly logger = new Logger(PLGIntelligenceService.name);

  constructor(
    @InjectRepository(ProductUsageEventEntity) private readonly usageRepo: Repository<ProductUsageEventEntity>,
    @InjectRepository(PQLScoreEntity) private readonly pqlRepo: Repository<PQLScoreEntity>,
    @InjectRepository(TrialConversionEntity) private readonly trialRepo: Repository<TrialConversionEntity>,
    @InjectRepository(ProductAdoptionEntity) private readonly adoptionRepo: Repository<ProductAdoptionEntity>,
  ) {}

  async trackUsage(workspaceId: string, data: Partial<ProductUsageEventEntity>): Promise<ProductUsageEventEntity> {
    const event = await this.usageRepo.save(this.usageRepo.create({ workspaceId, ...data }));
    this.logger.debug(`Usage tracked: ${data.featureName} by user ${data.userId}`);
    return event;
  }

  async calculatePQL(workspaceId: string, accountId: string): Promise<PQLScoreEntity> {
    let pql = await this.pqlRepo.findOne({ where: { workspaceId, accountId } });
    if (!pql) {
      pql = this.pqlRepo.create({ workspaceId, accountId });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const events = await this.usageRepo.find({
      where: { workspaceId },
    });

    // Filter events for this account's users (in a real system, we'd join on accountId)
    const recentEvents = events.filter((e) => new Date(e.createdAt) >= thirtyDaysAgo);

    const uniqueUsers = new Set(recentEvents.map((e) => e.userId));
    const uniqueFeatures = new Set(recentEvents.map((e) => e.featureName));

    pql.activeUsers = uniqueUsers.size;
    pql.featuresBreadth = uniqueFeatures.size;
    pql.usageFrequency = recentEvents.length / Math.max(1, uniqueUsers.size);

    // Feature depth: average duration per session
    const withDuration = recentEvents.filter((e) => e.durationMs !== null && e.durationMs !== undefined);
    pql.depthScore = withDuration.length > 0
      ? Math.min(100, withDuration.reduce((s, e) => s + (e.durationMs ?? 0), 0) / withDuration.length / 100)
      : 0;

    // Calculate composite PQL score
    pql.score = Math.min(100, Math.round(
      pql.activeUsers * 10 +
      pql.featuresBreadth * 5 +
      pql.usageFrequency * 3 +
      pql.depthScore * 0.5,
    ));

    // Assign grade
    if (pql.score >= 80) pql.grade = PQLGrade.HOT;
    else if (pql.score >= 50) pql.grade = PQLGrade.WARM;
    else if (pql.score >= 20) pql.grade = PQLGrade.COLD;
    else pql.grade = PQLGrade.DISQUALIFIED;

    // Top features
    const featureCounts: Record<string, number> = {};
    for (const e of recentEvents) {
      featureCounts[e.featureName] = (featureCounts[e.featureName] ?? 0) + e.count;
    }
    pql.topFeatures = Object.entries(featureCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name]) => name);

    pql.lastCalculatedAt = new Date();
    return this.pqlRepo.save(pql);
  }

  async getTrialMetrics(workspaceId: string): Promise<{
    totalTrials: number; activeTrials: number; convertedTrials: number;
    expiredTrials: number; conversionRate: number; avgDaysToConvert: number;
  }> {
    const trials = await this.trialRepo.find({ where: { workspaceId } });
    const active = trials.filter((t) => t.status === TrialStatus.ACTIVE);
    const converted = trials.filter((t) => t.status === TrialStatus.CONVERTED);
    const expired = trials.filter((t) => t.status === TrialStatus.EXPIRED);

    const daysToConvert = converted
      .filter((t) => t.convertedAt && t.trialStartDate)
      .map((t) => (new Date(t.convertedAt!).getTime() - new Date(t.trialStartDate).getTime()) / (1000 * 60 * 60 * 24));

    return {
      totalTrials: trials.length,
      activeTrials: active.length,
      convertedTrials: converted.length,
      expiredTrials: expired.length,
      conversionRate: trials.length > 0 ? Math.round((converted.length / trials.length) * 100) : 0,
      avgDaysToConvert: daysToConvert.length > 0
        ? Math.round(daysToConvert.reduce((s, d) => s + d, 0) / daysToConvert.length)
        : 0,
    };
  }

  async predictConversion(workspaceId: string, accountId: string): Promise<{
    probability: number; signals: Record<string, number>; recommendation: string;
  }> {
    const trial = await this.trialRepo.findOne({ where: { workspaceId, accountId, status: TrialStatus.ACTIVE } });
    if (!trial) throw new NotFoundException(`No active trial for account ${accountId}`);

    const pql = await this.pqlRepo.findOne({ where: { workspaceId, accountId } });
    const adoption = await this.adoptionRepo.findOne({ where: { workspaceId, accountId } });

    const signals: Record<string, number> = {};
    signals.pqlScore = pql?.score ?? 0;
    signals.featuresBreadth = Math.min(100, (pql?.featuresBreadth ?? 0) * 10);
    signals.activeUsers = Math.min(100, (pql?.activeUsers ?? 0) * 20);
    signals.daysRemaining = Math.max(0,
      (new Date(trial.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    signals.adoptionScore = adoption?.adoptionScore ?? 0;

    const probability = Math.min(100, Math.round(
      signals.pqlScore * 0.3 +
      signals.featuresBreadth * 0.2 +
      signals.activeUsers * 0.2 +
      signals.adoptionScore * 0.3,
    ));

    let recommendation = 'Monitor usage patterns';
    if (probability >= 80) recommendation = 'High conversion likelihood — prepare onboarding';
    else if (probability >= 50) recommendation = 'Schedule demo or success call';
    else if (probability < 30) recommendation = 'Intervene with targeted enablement';

    trial.conversionProbability = probability;
    await this.trialRepo.save(trial);

    return { probability, signals, recommendation };
  }

  async getAdoptionCurve(workspaceId: string, accountId: string): Promise<ProductAdoptionEntity> {
    let adoption = await this.adoptionRepo.findOne({ where: { workspaceId, accountId } });
    if (!adoption) {
      adoption = await this.adoptionRepo.save(this.adoptionRepo.create({ workspaceId, accountId }));
    }

    // Determine adoption stage based on metrics
    if (adoption.adoptionScore >= 80 && adoption.dauWauRatio >= 0.6) {
      adoption.stage = AdoptionStage.EXPANDING;
    } else if (adoption.adoptionScore >= 50) {
      adoption.stage = AdoptionStage.ADOPTING;
    } else if (adoption.adoptionScore >= 20) {
      adoption.stage = AdoptionStage.ACTIVATING;
    } else if (adoption.dauWauRatio < 0.1 && adoption.daysSinceFirstUse > 30) {
      adoption.stage = AdoptionStage.CHURNING;
    } else {
      adoption.stage = AdoptionStage.ONBOARDING;
    }

    return this.adoptionRepo.save(adoption);
  }

  async getFeatureUsage(workspaceId: string): Promise<Array<{
    featureName: string; totalUsage: number; uniqueUsers: number; avgDurationMs: number;
  }>> {
    const events = await this.usageRepo.find({ where: { workspaceId } });
    const featureMap: Record<string, { usage: number; users: Set<string>; totalDuration: number; durationCount: number }> = {};

    for (const event of events) {
      if (!featureMap[event.featureName]) {
        featureMap[event.featureName] = { usage: 0, users: new Set(), totalDuration: 0, durationCount: 0 };
      }
      featureMap[event.featureName].usage += event.count;
      featureMap[event.featureName].users.add(event.userId);
      if (event.durationMs) {
        featureMap[event.featureName].totalDuration += event.durationMs;
        featureMap[event.featureName].durationCount++;
      }
    }

    return Object.entries(featureMap)
      .map(([featureName, data]) => ({
        featureName,
        totalUsage: data.usage,
        uniqueUsers: data.users.size,
        avgDurationMs: data.durationCount > 0 ? Math.round(data.totalDuration / data.durationCount) : 0,
      }))
      .sort((a, b) => b.totalUsage - a.totalUsage);
  }
}
