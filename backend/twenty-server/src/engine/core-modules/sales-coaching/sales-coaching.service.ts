import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CoachingSessionEntity, CallReviewEntity, RepScorecardEntity, SkillGapEntity,
  SessionStatus, SkillCategory, GapSeverity, CallOutcome,
} from './sales-coaching.entity';

@Injectable()
export class SalesCoachingService {
  private readonly logger = new Logger(SalesCoachingService.name);

  constructor(
    @InjectRepository(CoachingSessionEntity) private readonly sessionRepo: Repository<CoachingSessionEntity>,
    @InjectRepository(CallReviewEntity) private readonly callReviewRepo: Repository<CallReviewEntity>,
    @InjectRepository(RepScorecardEntity) private readonly scorecardRepo: Repository<RepScorecardEntity>,
    @InjectRepository(SkillGapEntity) private readonly skillGapRepo: Repository<SkillGapEntity>,
  ) {}

  async createSession(workspaceId: string, data: Partial<CoachingSessionEntity>): Promise<CoachingSessionEntity> {
    return this.sessionRepo.save(this.sessionRepo.create({ workspaceId, ...data }));
  }

  async reviewCall(workspaceId: string, data: Partial<CallReviewEntity>): Promise<CallReviewEntity> {
    // Calculate overall score as weighted average of sub-scores
    const scores = [
      { value: data.discoveryScore, weight: 0.25 },
      { value: data.objectionHandlingScore, weight: 0.25 },
      { value: data.closingScore, weight: 0.25 },
      { value: data.presentationScore, weight: 0.25 },
    ];

    const validScores = scores.filter((s) => s.value !== null && s.value !== undefined);
    if (validScores.length > 0) {
      const totalWeight = validScores.reduce((s, sc) => s + sc.weight, 0);
      data.overallScore = Math.round(
        validScores.reduce((s, sc) => s + (sc.value ?? 0) * (sc.weight / totalWeight), 0) * 10,
      ) / 10;
    }

    const review = await this.callReviewRepo.save(this.callReviewRepo.create({ workspaceId, ...data }));

    // Auto-detect skill gaps from low scores
    if (data.repId) {
      const gapThreshold = 60;
      const gapChecks: Array<{ score: number | undefined | null; category: SkillCategory }> = [
        { score: data.discoveryScore, category: SkillCategory.DISCOVERY },
        { score: data.objectionHandlingScore, category: SkillCategory.OBJECTION_HANDLING },
        { score: data.closingScore, category: SkillCategory.CLOSING },
        { score: data.presentationScore, category: SkillCategory.PRESENTATION },
      ];

      for (const check of gapChecks) {
        if (check.score !== null && check.score !== undefined && check.score < gapThreshold) {
          const existingGap = await this.skillGapRepo.findOne({
            where: { workspaceId, repId: data.repId, category: check.category, isResolved: false },
          });

          if (!existingGap) {
            await this.skillGapRepo.save(this.skillGapRepo.create({
              workspaceId, repId: data.repId,
              category: check.category,
              severity: check.score < 30 ? GapSeverity.CRITICAL : check.score < 50 ? GapSeverity.HIGH : GapSeverity.MEDIUM,
              currentLevel: check.score,
              targetLevel: 80,
              gapSize: 80 - check.score,
              relatedCallIds: [review.id],
            }));
          }
        }
      }
    }

    return review;
  }

  async generateScorecard(workspaceId: string, repId: string, periodStart: Date, periodEnd: Date): Promise<RepScorecardEntity> {
    const reviews = await this.callReviewRepo.find({ where: { workspaceId, repId } });
    const periodReviews = reviews.filter((r) => {
      const d = r.callDate ? new Date(r.callDate) : new Date(r.createdAt);
      return d >= periodStart && d <= periodEnd;
    });

    const sessions = await this.sessionRepo.find({
      where: { workspaceId, repId, status: SessionStatus.COMPLETED },
    });
    const periodSessions = sessions.filter((s) => {
      const d = new Date(s.createdAt);
      return d >= periodStart && d <= periodEnd;
    });

    let scorecard = await this.scorecardRepo.findOne({
      where: { workspaceId, repId, periodStart, periodEnd },
    });

    if (!scorecard) {
      scorecard = this.scorecardRepo.create({ workspaceId, repId });
    }

    const avg = (arr: Array<number | null | undefined>): number => {
      const valid = arr.filter((v): v is number => v !== null && v !== undefined);
      return valid.length > 0 ? Math.round(valid.reduce((s, v) => s + v, 0) / valid.length * 10) / 10 : 0;
    };

    scorecard.periodStart = periodStart;
    scorecard.periodEnd = periodEnd;
    scorecard.callsReviewed = periodReviews.length;
    scorecard.sessionsCompleted = periodSessions.length;
    scorecard.discoveryScore = avg(periodReviews.map((r) => r.discoveryScore));
    scorecard.objectionScore = avg(periodReviews.map((r) => r.objectionHandlingScore));
    scorecard.closingScore = avg(periodReviews.map((r) => r.closingScore));
    scorecard.presentationScore = avg(periodReviews.map((r) => r.presentationScore));
    scorecard.overallScore = avg(periodReviews.map((r) => r.overallScore));

    // Win rate from call outcomes
    const withOutcome = periodReviews.filter((r) => r.outcome);
    const wins = withOutcome.filter((r) => r.outcome === CallOutcome.WON);
    scorecard.winRate = withOutcome.length > 0 ? Math.round((wins.length / withOutcome.length) * 100) : 0;

    return this.scorecardRepo.save(scorecard);
  }

  async identifySkillGaps(workspaceId: string, repId: string): Promise<SkillGapEntity[]> {
    return this.skillGapRepo.find({
      where: { workspaceId, repId, isResolved: false },
      order: { severity: 'ASC', gapSize: 'DESC' },
    });
  }

  async getTeamBenchmarks(workspaceId: string): Promise<Array<{
    repId: string; overallScore: number; callsReviewed: number; winRate: number; rank: number;
  }>> {
    const scorecards = await this.scorecardRepo.find({
      where: { workspaceId },
      order: { periodEnd: 'DESC' },
    });

    // Get latest scorecard per rep
    const latestByRep: Record<string, RepScorecardEntity> = {};
    for (const sc of scorecards) {
      if (!latestByRep[sc.repId] || new Date(sc.periodEnd ?? 0) > new Date(latestByRep[sc.repId].periodEnd ?? 0)) {
        latestByRep[sc.repId] = sc;
      }
    }

    const benchmarks = Object.values(latestByRep)
      .map((sc) => ({
        repId: sc.repId,
        overallScore: sc.overallScore,
        callsReviewed: sc.callsReviewed,
        winRate: sc.winRate ?? 0,
        rank: 0,
      }))
      .sort((a, b) => b.overallScore - a.overallScore);

    benchmarks.forEach((b, i) => { b.rank = i + 1; });

    return benchmarks;
  }

  async suggestTraining(workspaceId: string, repId: string): Promise<Array<{
    category: string; severity: string; gapSize: number; recommendations: string[];
  }>> {
    const gaps = await this.skillGapRepo.find({
      where: { workspaceId, repId, isResolved: false },
      order: { severity: 'ASC' },
    });

    const trainingMap: Record<string, string[]> = {
      [SkillCategory.DISCOVERY]: ['SPIN Selling methodology', 'Challenger Sale training', 'Active listening workshop'],
      [SkillCategory.OBJECTION_HANDLING]: ['Objection handling framework', 'Competitive intelligence training', 'Value selling workshop'],
      [SkillCategory.CLOSING]: ['Closing techniques masterclass', 'Negotiation skills training', 'Deal progression workshop'],
      [SkillCategory.PRESENTATION]: ['Storytelling for sales', 'Demo skills training', 'Presentation effectiveness'],
      [SkillCategory.NEGOTIATION]: ['BATNA negotiation framework', 'Procurement process training', 'Pricing strategy workshop'],
      [SkillCategory.RAPPORT]: ['Relationship building techniques', 'Executive presence training', 'Communication styles workshop'],
    };

    return gaps.map((gap) => ({
      category: gap.category,
      severity: gap.severity,
      gapSize: gap.gapSize,
      recommendations: gap.recommendedTraining ?? trainingMap[gap.category] ?? ['General sales training'],
    }));
  }
}
