import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { type CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';

import { ICPFitEntity, ICPCriteriaEntity, ICPScoreLevel } from './icp-fit.entity';

@Injectable()
export class ICPFitService {
  constructor(
    @InjectRepository(ICPFitEntity)
    private readonly fitRepo: Repository<ICPFitEntity>,
    @InjectRepository(ICPCriteriaEntity)
    private readonly criteriaRepo: Repository<ICPCriteriaEntity>,
  ) {}

  async createCriteria(
    workspaceId: string,
    data: Partial<ICPCriteriaEntity> & { name: string },
  ): Promise<ICPCriteriaEntity> {
    const criteria = this.criteriaRepo.create({
      workspaceId,
      name: data.name,
      description: data.description ?? null,
      criteria: data.criteria ?? {},
      weight: data.weight ?? 1,
      enabled: data.enabled ?? true,
      isRequired: data.isRequired ?? false,
    } as Partial<ICPCriteriaEntity>);

    return (await this.criteriaRepo.save(criteria)) as ICPCriteriaEntity;
  }

  async listCriteria(workspaceId: string): Promise<ICPCriteriaEntity[]> {
    return this.criteriaRepo.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  async evaluateCompany(
    workspaceId: string,
    company: Partial<CompanyWorkspaceEntity> & { id: string },
    options: {
      criteria?: ICPCriteriaEntity[];
      behavioralSignals?: {
        pageViews?: number;
        emailOpens?: number;
        emailClicks?: number;
        meetingAttendance?: number;
      };
    } = {},
  ): Promise<ICPFitEntity> {
    const criteria = options.criteria ?? (await this.listCriteria(workspaceId)).filter((item) => item.enabled);
    const behavioralSignals = options.behavioralSignals ?? {};
    const evaluation = this.scoreCompany(company, criteria, behavioralSignals);

    const fit = this.fitRepo.create({
      workspaceId,
      companyId: company.id,
      overallScore: evaluation.overallScore,
      level: evaluation.level,
      firmographicScore: evaluation.firmographicScore,
      technographicScore: evaluation.technographicScore,
      behavioralScore: evaluation.behavioralScore,
      criteriaBreakdown: evaluation.criteriaBreakdown,
      matchedCriteria: evaluation.matchedCriteria,
      failedCriteria: evaluation.failedCriteria,
      recommendations: evaluation.recommendations,
      computedAt: new Date(),
    });

    return this.fitRepo.save(fit);
  }

  async getFit(workspaceId: string, companyId: string): Promise<ICPFitEntity | null> {
    return this.fitRepo.findOne({ where: { workspaceId, companyId } });
  }

  async getSummary(workspaceId: string): Promise<{
    companiesScored: number;
    averageScore: number;
    excellentCount: number;
    goodCount: number;
    fairCount: number;
    poorCount: number;
  }> {
    const fits = await this.fitRepo.find({ where: { workspaceId } });
    return {
      companiesScored: fits.length,
      averageScore: fits.length
        ? Number((fits.reduce((sum, fit) => sum + (fit.overallScore ?? 0), 0) / fits.length).toFixed(2))
        : 0,
      excellentCount: fits.filter((fit) => fit.level === ICPScoreLevel.EXCELLENT).length,
      goodCount: fits.filter((fit) => fit.level === ICPScoreLevel.GOOD).length,
      fairCount: fits.filter((fit) => fit.level === ICPScoreLevel.FAIR).length,
      poorCount: fits.filter((fit) => fit.level === ICPScoreLevel.POOR).length,
    };
  }

  async recomputeFit(workspaceId: string, companyId: string): Promise<ICPFitEntity> {
    const existing = await this.getFit(workspaceId, companyId);
    if (!existing) {
      throw new NotFoundException(`ICP fit for company ${companyId} not found`);
    }

    const evaluation = this.scoreCompany(
      {
        id: companyId,
        name: '',
      },
      await this.listCriteria(workspaceId),
      {},
    );

    existing.overallScore = evaluation.overallScore;
    existing.level = evaluation.level;
    existing.firmographicScore = evaluation.firmographicScore;
    existing.technographicScore = evaluation.technographicScore;
    existing.behavioralScore = evaluation.behavioralScore;
    existing.criteriaBreakdown = evaluation.criteriaBreakdown;
    existing.matchedCriteria = evaluation.matchedCriteria;
    existing.failedCriteria = evaluation.failedCriteria;
    existing.recommendations = evaluation.recommendations;
    existing.computedAt = new Date();

    return this.fitRepo.save(existing);
  }

  private scoreCompany(
    company: Partial<CompanyWorkspaceEntity> & { id: string },
    criteria: ICPCriteriaEntity[],
    behavioralSignals: {
      pageViews?: number;
      emailOpens?: number;
      emailClicks?: number;
      meetingAttendance?: number;
    },
  ): {
    overallScore: number;
    level: ICPScoreLevel;
    firmographicScore: number;
    technographicScore: number;
    behavioralScore: number;
    criteriaBreakdown: Record<string, { score: number; passed: boolean; weight: number }>;
    matchedCriteria: string[];
    failedCriteria: string[];
    recommendations: string[];
  } {
    const firmographicScore = this.scoreFirmographics(company);
    const technographicScore = this.scoreTechnographics(company);
    const behavioralScore = this.scoreBehavioral(behavioralSignals);
    const criteriaEvaluation = this.scoreCustomCriteria(company, criteria);

    const weightedScore =
      firmographicScore * 0.45 +
      technographicScore * 0.2 +
      behavioralScore * 0.2 +
      criteriaEvaluation.score * 0.15;

    const overallScore = Math.max(0, Math.min(100, Math.round(weightedScore)));
    const level = this.scoreToLevel(overallScore);

    return {
      overallScore,
      level,
      firmographicScore,
      technographicScore,
      behavioralScore,
      criteriaBreakdown: criteriaEvaluation.breakdown,
      matchedCriteria: criteriaEvaluation.matched,
      failedCriteria: criteriaEvaluation.failed,
      recommendations: this.buildRecommendations(company, overallScore, criteriaEvaluation.failed),
    };
  }

  private scoreFirmographics(company: Partial<CompanyWorkspaceEntity>): number {
    let score = 40;
    const employees = this.asNumber(company.employees);
    const arr = this.asCurrencyValue(company.annualRecurringRevenue);
    const ideal = Boolean(company.idealCustomerProfile);
    const domain = this.hasValue(company.domainName);

    if (ideal) score += 25;
    if (domain) score += 10;
    if (employees !== null) {
      if (employees >= 200) score += 15;
      else if (employees >= 50) score += 10;
      else if (employees >= 10) score += 5;
      else score -= 5;
    }

    if (arr !== null) {
      if (arr >= 1000000) score += 15;
      else if (arr >= 250000) score += 10;
      else if (arr >= 50000) score += 5;
      else score -= 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  private scoreTechnographics(company: Partial<CompanyWorkspaceEntity>): number {
    let score = 35;
    if (this.hasValue(company.linkedinLink)) score += 20;
    if (this.hasValue(company.xLink)) score += 10;
    if (this.hasValue(company.address)) score += 10;
    if (this.hasValue(company.accountOwnerId)) score += 15;
    return Math.max(0, Math.min(100, score));
  }

  private scoreBehavioral(signals: {
    pageViews?: number;
    emailOpens?: number;
    emailClicks?: number;
    meetingAttendance?: number;
  }): number {
    const pageViews = signals.pageViews ?? 0;
    const emailOpens = signals.emailOpens ?? 0;
    const emailClicks = signals.emailClicks ?? 0;
    const meetingAttendance = signals.meetingAttendance ?? 0;

    const score =
      Math.min(20, pageViews * 2) +
      Math.min(25, emailOpens * 3) +
      Math.min(25, emailClicks * 5) +
      Math.min(30, meetingAttendance * 15);

    return Math.max(0, Math.min(100, score));
  }

  private scoreCustomCriteria(
    company: Partial<CompanyWorkspaceEntity>,
    criteria: ICPCriteriaEntity[],
  ): {
    score: number;
    breakdown: Record<string, { score: number; passed: boolean; weight: number }>;
    matched: string[];
    failed: string[];
  } {
    let weightedScore = 0;
    let totalWeight = 0;
    const breakdown: Record<string, { score: number; passed: boolean; weight: number }> = {};
    const matched: string[] = [];
    const failed: string[] = [];

    for (const criterion of criteria) {
      const result = this.evaluateCriterion(company, criterion);
      breakdown[criterion.name] = result;
      totalWeight += result.weight;
      weightedScore += result.score * result.weight;
      if (result.passed) matched.push(criterion.name);
      else failed.push(criterion.name);
    }

    return {
      score: totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0,
      breakdown,
      matched,
      failed,
    };
  }

  private evaluateCriterion(
    company: Partial<CompanyWorkspaceEntity>,
    criterion: ICPCriteriaEntity,
  ): { score: number; passed: boolean; weight: number } {
    const config = criterion.criteria ?? {};
    let score = 0;

    if (typeof config['minEmployees'] === 'number') {
      const employees = this.asNumber(company.employees) ?? 0;
      if (employees >= config['minEmployees']) score += 50;
    }

    if (typeof config['minARR'] === 'number') {
      const arr = this.asCurrencyValue(company.annualRecurringRevenue) ?? 0;
      if (arr >= config['minARR']) score += 50;
    }

    if (Array.isArray(config['requiredDomains'])) {
      const domains = this.normalizeMultiValue(company.domainName);
      const matches = config['requiredDomains'].some((domain: string) => domains.includes(domain.toLowerCase()));
      if (matches) score += 50;
    }

    if (Array.isArray(config['excludedDomains'])) {
      const domains = this.normalizeMultiValue(company.domainName);
      const matches = config['excludedDomains'].some((domain: string) => domains.includes(domain.toLowerCase()));
      if (!matches) score += 25;
    }

    if (typeof config['mustBeICP'] === 'boolean') {
      if (Boolean(company.idealCustomerProfile) === config['mustBeICP']) score += 25;
    }

    const passed = score >= 50 || criterion.isRequired;
    return {
      score: Math.max(0, Math.min(100, score)),
      passed,
      weight: criterion.weight ?? 1,
    };
  }

  private buildRecommendations(
    company: Partial<CompanyWorkspaceEntity>,
    overallScore: number,
    failedCriteria: string[],
  ): string[] {
    const recommendations: string[] = [];
    if (overallScore >= 80) {
      recommendations.push('Prioritize for outbound and sales follow-up');
      recommendations.push('Add to high-intent account list');
    } else if (overallScore >= 60) {
      recommendations.push('Nurture with targeted content');
      recommendations.push('Monitor for engagement spikes');
    } else {
      recommendations.push('Do not prioritize until fit improves');
      recommendations.push('Review firmographic requirements');
    }

    if (!this.hasValue(company.domainName)) recommendations.push('Enrich company domain data');
    if (!this.hasValue(company.linkedinLink)) recommendations.push('Add LinkedIn profile enrichment');
    if (failedCriteria.length > 0) {
      recommendations.push(`Address failed criteria: ${failedCriteria.slice(0, 3).join(', ')}`);
    }

    return recommendations;
  }

  private scoreToLevel(score: number): ICPScoreLevel {
    if (score >= 85) return ICPScoreLevel.EXCELLENT;
    if (score >= 70) return ICPScoreLevel.GOOD;
    if (score >= 50) return ICPScoreLevel.FAIR;
    return ICPScoreLevel.POOR;
  }

  private normalizeMultiValue(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value
        .flatMap((item) => (typeof item === 'string' ? item : []))
        .map((item) => item.toLowerCase());
    }
    if (typeof value === 'string') {
      return [value.toLowerCase()];
    }
    return [];
  }

  private hasValue(value: unknown): boolean {
    if (Array.isArray(value)) return value.length > 0;
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'object') return true;
    return true;
  }

  private asNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    return null;
  }

  private asCurrencyValue(value: unknown): number | null {
    if (typeof value === 'number') return value;
    if (value && typeof value === 'object' && 'amount' in value) {
      const amount = (value as { amount?: unknown }).amount;
      return typeof amount === 'number' ? amount : null;
    }
    return null;
  }
}
