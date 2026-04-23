import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  DealQualification,
  DealQualificationAgent,
  DealQualificationStatus,
  QualificationFramework,
} from './deal-qualification-agent.entity';

@Injectable()
export class DealQualificationAgentService {
  constructor(
    @InjectRepository(DealQualificationAgent, 'core')
    private readonly agentRepo: Repository<DealQualificationAgent>,
    @InjectRepository(DealQualification, 'core')
    private readonly qualificationRepo: Repository<DealQualification>,
  ) {}

  async findAll(workspaceId: string): Promise<DealQualificationAgent[]> {
    return this.agentRepo.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, workspaceId: string): Promise<DealQualificationAgent | null> {
    return this.agentRepo.findOne({ where: { id, workspaceId } });
  }

  async create(
    workspaceId: string,
    data: Partial<DealQualificationAgent> & { name: string },
  ): Promise<DealQualificationAgent> {
    const agent = this.agentRepo.create({
      ...data,
      workspaceId,
      status: data.status ?? DealQualificationStatus.PAUSED,
      framework: data.framework ?? QualificationFramework.BANT,
      autoScoreEnabled: data.autoScoreEnabled ?? true,
      questionsSuggestionsEnabled: data.questionsSuggestionsEnabled ?? true,
      gapsDetectionEnabled: data.gapsDetectionEnabled ?? true,
      dealsQualifiedCount: data.dealsQualifiedCount ?? 0,
      dealsDisqualifiedCount: data.dealsDisqualifiedCount ?? 0,
      questionsSuggestedCount: data.questionsSuggestedCount ?? 0,
    });
    return this.agentRepo.save(agent);
  }

  async update(
    id: string,
    workspaceId: string,
    data: Partial<DealQualificationAgent>,
  ): Promise<DealQualificationAgent> {
    await this.agentRepo.update({ id, workspaceId }, data as never);
    const agent = await this.findOne(id, workspaceId);
    if (!agent) throw new NotFoundException(`Deal qualification agent ${id} not found`);
    return agent;
  }

  async start(id: string, workspaceId: string): Promise<DealQualificationAgent> {
    return this.update(id, workspaceId, { status: DealQualificationStatus.ACTIVE, lastRunAt: new Date() });
  }

  async pause(id: string, workspaceId: string): Promise<DealQualificationAgent> {
    return this.update(id, workspaceId, { status: DealQualificationStatus.PAUSED });
  }

  async stop(id: string, workspaceId: string): Promise<DealQualificationAgent> {
    return this.update(id, workspaceId, { status: DealQualificationStatus.STOPPED });
  }

  async qualifyDeal(
    workspaceId: string,
    deal: {
      id: string;
      name: string;
      amount?: number;
      companyName?: string;
      stage?: string;
      closeDate?: Date | null;
      stakeholderCount?: number;
      lastActivityAt?: Date | null;
      competitorMentions?: string[];
      budgetConfirmed?: boolean;
      authorityConfirmed?: boolean;
      needConfirmed?: boolean;
      timelineConfirmed?: boolean;
      customSignals?: Record<string, unknown>;
    },
    framework: QualificationFramework = QualificationFramework.BANT,
  ): Promise<DealQualification> {
    const scoring = this.scoreDeal(deal, framework);

    const qualification = this.qualificationRepo.create({
      workspaceId,
      dealId: deal.id,
      overallScore: scoring.overallScore,
      qualificationLevel: scoring.qualificationLevel,
      criteriaScores: scoring.criteriaScores,
      gapsIdentified: scoring.gapsIdentified.join('; '),
      suggestedQuestions: scoring.suggestedQuestions,
      recommendation: scoring.recommendation,
    });

    return this.qualificationRepo.save(qualification);
  }

  async getQualificationHistory(workspaceId: string, dealId: string): Promise<DealQualification[]> {
    return this.qualificationRepo.find({
      where: { workspaceId, dealId },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async getSummary(workspaceId: string): Promise<{
    agents: number;
    activeAgents: number;
    qualifications: number;
    averageScore: number;
    qualifiedDeals: number;
    disqualifiedDeals: number;
  }> {
    const [agents, qualifications] = await Promise.all([
      this.agentRepo.find({ where: { workspaceId } }),
      this.qualificationRepo.find({ where: { workspaceId } }),
    ]);

    return {
      agents: agents.length,
      activeAgents: agents.filter((agent) => agent.status === DealQualificationStatus.ACTIVE).length,
      qualifications: qualifications.length,
      averageScore: qualifications.length
        ? Number((qualifications.reduce((sum, item) => sum + (item.overallScore ?? 0), 0) / qualifications.length).toFixed(2))
        : 0,
      qualifiedDeals: qualifications.filter((item) => this.isQualified(item.overallScore ?? 0)).length,
      disqualifiedDeals: qualifications.filter((item) => !this.isQualified(item.overallScore ?? 0)).length,
    };
  }

  private scoreDeal(
    deal: {
      id: string;
      name: string;
      amount?: number;
      companyName?: string;
      stage?: string;
      closeDate?: Date | null;
      stakeholderCount?: number;
      lastActivityAt?: Date | null;
      competitorMentions?: string[];
      budgetConfirmed?: boolean;
      authorityConfirmed?: boolean;
      needConfirmed?: boolean;
      timelineConfirmed?: boolean;
      customSignals?: Record<string, unknown>;
    },
    framework: QualificationFramework,
  ): {
    overallScore: number;
    qualificationLevel: string;
    criteriaScores: Record<string, unknown>;
    gapsIdentified: string[];
    suggestedQuestions: string[];
    recommendation: string;
  } {
    const now = new Date();
    const stage = (deal.stage ?? '').toLowerCase();
    const daysSinceActivity = deal.lastActivityAt
      ? Math.floor((now.getTime() - deal.lastActivityAt.getTime()) / (24 * 60 * 60 * 1000))
      : 0;

    const budgetScore = this.scoreBoolean(deal.budgetConfirmed, 25);
    const authorityScore = this.scoreBoolean(deal.authorityConfirmed, 25);
    const needScore = this.scoreBoolean(deal.needConfirmed, 25);
    const timelineScore = this.scoreBoolean(deal.timelineConfirmed, 25);
    const amountScore = this.scoreAmount(deal.amount ?? 0);
    const stakeholderScore = this.scoreStakeholders(deal.stakeholderCount ?? 0);
    const activityScore = Math.max(0, 20 - Math.min(daysSinceActivity, 20));
    const competitorPenalty = Math.min(15, (deal.competitorMentions?.length ?? 0) * 5);

    const criteriaScores: Record<string, unknown> = {
      framework,
      budgetScore,
      authorityScore,
      needScore,
      timelineScore,
      amountScore,
      stakeholderScore,
      activityScore,
      competitorPenalty,
    };

    let overallScore =
      budgetScore +
      authorityScore +
      needScore +
      timelineScore +
      amountScore +
      stakeholderScore +
      activityScore -
      competitorPenalty;

    if (stage.includes('proposal')) overallScore += 5;
    if (stage.includes('negotiation')) overallScore += 8;
    if (stage.includes('closed_lost')) overallScore -= 20;

    overallScore = Math.max(0, Math.min(100, Math.round(overallScore)));

    const gapsIdentified: string[] = [];
    if (budgetScore < 15) gapsIdentified.push('Budget not confirmed');
    if (authorityScore < 15) gapsIdentified.push('Decision authority unclear');
    if (needScore < 15) gapsIdentified.push('Need not fully validated');
    if (timelineScore < 15) gapsIdentified.push('Timeline uncertain');
    if (stakeholderScore < 10) gapsIdentified.push('Not enough stakeholders engaged');
    if (competitorPenalty > 0) gapsIdentified.push('Competitor pressure present');
    if (daysSinceActivity > 14) gapsIdentified.push('Deal has stalled');

    const suggestedQuestions = this.buildSuggestedQuestions({
      budgetScore,
      authorityScore,
      needScore,
      timelineScore,
      stakeholderScore,
      competitorPenalty,
    });

    return {
      overallScore,
      qualificationLevel: this.getQualificationLevel(overallScore),
      criteriaScores,
      gapsIdentified,
      suggestedQuestions,
      recommendation: this.buildRecommendation(overallScore, gapsIdentified),
    };
  }

  private buildSuggestedQuestions(scores: Record<string, number>): string[] {
    const questions: string[] = [];
    if (scores.budgetScore < 15) questions.push('Is budget already approved for this project?');
    if (scores.authorityScore < 15) questions.push('Who signs off on the final decision?');
    if (scores.needScore < 15) questions.push('What business problem must this solve?');
    if (scores.timelineScore < 15) questions.push('When do you need this live?');
    if (scores.stakeholderScore < 10) questions.push('Who else should be involved in the evaluation?');
    if (scores.competitorPenalty > 0) questions.push('What is the strongest alternative you are comparing against?');
    return questions.length > 0 ? questions : ['What would make this deal a clear priority?'];
  }

  private buildRecommendation(overallScore: number, gaps: string[]): string {
    if (overallScore >= 80) return 'Proceed: strong qualification, move to next step.';
    if (overallScore >= 60) return `Continue qualifying. Address: ${gaps.slice(0, 2).join(', ')}.`;
    return `Hold or disqualify until: ${gaps.slice(0, 3).join(', ')}.`;
  }

  private getQualificationLevel(score: number): string {
    if (score >= 80) return 'qualified';
    if (score >= 60) return 'working';
    if (score >= 40) return 'weak';
    return 'disqualified';
  }

  private isQualified(score: number): boolean {
    return score >= 60;
  }

  private scoreBoolean(value: boolean | undefined, points: number): number {
    return value ? points : 0;
  }

  private scoreAmount(amount: number): number {
    if (amount >= 100000) return 20;
    if (amount >= 50000) return 15;
    if (amount >= 10000) return 10;
    if (amount > 0) return 5;
    return 0;
  }

  private scoreStakeholders(count: number): number {
    if (count >= 5) return 15;
    if (count >= 3) return 10;
    if (count >= 1) return 5;
    return 0;
  }
}
