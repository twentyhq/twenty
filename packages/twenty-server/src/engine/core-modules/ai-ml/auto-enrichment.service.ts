import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { type CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { type OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

import {
  AutoEnrichmentEntity,
  EnrichmentLogEntity,
  EnrichmentSource,
  EnrichmentStatus,
} from './auto-enrichment.entity';

@Injectable()
export class AutoEnrichmentService {
  constructor(
    @InjectRepository(AutoEnrichmentEntity)
    private readonly configRepo: Repository<AutoEnrichmentEntity>,
    @InjectRepository(EnrichmentLogEntity)
    private readonly logRepo: Repository<EnrichmentLogEntity>,
  ) {}

  async getConfig(workspaceId: string, recordId?: string, recordType?: string): Promise<AutoEnrichmentEntity> {
    void recordId;
    void recordType;

    let config = await this.configRepo.findOne({ where: { workspaceId } });
    if (!config) {
      config = this.configRepo.create({
        workspaceId,
        recordId: recordId ?? null,
        recordType: recordType ?? null,
        enabled: true,
        status: EnrichmentStatus.PENDING,
        enabledSources: [EnrichmentSource.CUSTOM, EnrichmentSource.LINKEDIN],
        refreshIntervalHours: 24,
        recordsEnriched: 0,
        dataQualityScore: 0,
        fieldMappings: {},
        lastEnrichedAt: null,
        failureReason: null,
        latestSnapshot: null,
      });
      config = await this.configRepo.save(config);
    }

    return config;
  }

  async updateConfig(
    workspaceId: string,
    updates: Partial<AutoEnrichmentEntity>,
    recordId?: string,
    recordType?: string,
  ): Promise<AutoEnrichmentEntity> {
    const config = await this.getConfig(workspaceId, recordId, recordType);
    Object.assign(config, updates);
    return this.configRepo.save(config);
  }

  async enrichRecord(
    workspaceId: string,
    record: {
      id: string;
      type: 'company' | 'person' | 'opportunity';
      payload: Record<string, unknown>;
    },
  ): Promise<EnrichmentLogEntity> {
    const config = await this.getConfig(workspaceId, record.id, record.type);
    if (!config.enabled) {
      throw new NotFoundException(`Auto enrichment disabled for ${record.type} ${record.id}`);
    }

    await this.configRepo.update(config.id, {
      status: EnrichmentStatus.ENRICHING,
    });

    const enrichedData = this.buildEnrichedSnapshot(record.type, record.payload);
    const dataQualityScore = this.computeDataQualityScore(enrichedData);
    const source = this.pickSource(record.type, enrichedData);

    const log = this.logRepo.create({
      workspaceId,
      recordId: record.id,
      recordType: record.type,
      source,
      enrichedData,
      status: EnrichmentStatus.COMPLETED,
      errorMessage: null,
    });

    await this.logRepo.save(log);

    config.status = EnrichmentStatus.COMPLETED;
    config.recordsEnriched = (config.recordsEnriched ?? 0) + 1;
    config.dataQualityScore = dataQualityScore;
    config.lastEnrichedAt = new Date();
    config.failureReason = null;
    config.latestSnapshot = enrichedData as AutoEnrichmentEntity['latestSnapshot'];
    await this.configRepo.save(config);

    return log;
  }

  async getHistory(workspaceId: string, recordId?: string): Promise<EnrichmentLogEntity[]> {
    const where: Record<string, unknown> = { workspaceId };
    if (recordId) where.recordId = recordId;

    return this.logRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async getSummary(workspaceId: string): Promise<{
    enabled: boolean;
    recordsEnriched: number;
    averageDataQuality: number;
    lastEnrichedAt: Date | null;
    activeSources: EnrichmentSource[];
  }> {
    const config = await this.getConfig(workspaceId);
    return {
      enabled: config.enabled,
      recordsEnriched: config.recordsEnriched ?? 0,
      averageDataQuality: Number((config.dataQualityScore ?? 0).toFixed(2)),
      lastEnrichedAt: config.lastEnrichedAt ?? null,
      activeSources: config.enabledSources ?? [],
    };
  }

  private buildEnrichedSnapshot(
    type: 'company' | 'person' | 'opportunity',
    payload: Record<string, unknown>,
  ): Record<string, unknown> {
    if (type === 'company') return this.enrichCompany(payload);
    if (type === 'person') return this.enrichPerson(payload);
    return this.enrichOpportunity(payload);
  }

  private enrichCompany(payload: Record<string, unknown>): Record<string, unknown> {
    const name = this.asString(payload.name) ?? this.asString(payload.companyName) ?? '';
    const domain = this.normalizeDomain(this.asString(payload.domainName) ?? this.asString(payload.domain) ?? name);
    const employees = this.asNumber(payload.employees) ?? this.estimateEmployees(name, domain);
    const revenue = this.asNumber(payload.annualRecurringRevenue) ?? this.estimateRevenue(employees);

    return {
      ...payload,
      normalizedName: this.titleCase(name),
      domainName: domain ? [domain] : [],
      linkedinLink: this.buildLinkedInUrl(name, 'company'),
      employeeCountEstimate: employees,
      revenueRange: revenue,
      idealCustomerProfile: Boolean(payload.idealCustomerProfile) || employees >= 50,
      enrichmentSignals: {
        hasDomain: Boolean(domain),
        hasPhone: Boolean(payload.phone || payload.phones),
        hasLocation: Boolean(payload.address),
        hasSocialProfile: Boolean(payload.linkedinLink || payload.xLink),
      },
    };
  }

  private enrichPerson(payload: Record<string, unknown>): Record<string, unknown> {
    const name = this.asString(payload.name) ?? '';
    const jobTitle = this.asString(payload.jobTitle) ?? '';
    const companyName = this.asString(payload.companyName) ?? '';
    const email = this.firstEmail(payload.emails);

    return {
      ...payload,
      normalizedName: this.titleCase(name),
      seniority: this.getSeniority(jobTitle),
      companyName: companyName || null,
      emailDomain: email ? this.extractDomainFromEmail(email) : null,
      linkedinLink: this.buildLinkedInUrl(name, 'person'),
      contactQualityScore: this.computeContactScore(name, jobTitle, companyName, email),
    };
  }

  private enrichOpportunity(payload: Record<string, unknown>): Record<string, unknown> {
    const amount = this.asCurrencyNumber(payload.amount) ?? this.asNumber(payload.expectedValue) ?? 0;
    const stage = this.asString(payload.stage) ?? 'prospecting';
    const closeDate = this.asDate(payload.closeDate);
    const daysToClose = closeDate ? Math.ceil((closeDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)) : null;

    return {
      ...payload,
      expectedValue: amount,
      dealHealthScore: this.computeDealHealthScore(stage, amount, daysToClose),
      nextBestAction: this.suggestNextAction(stage, amount),
      urgency: this.computeUrgency(daysToClose),
      likelyLossReasons: this.getLikelyLossReasons(stage, amount, daysToClose),
    };
  }

  private pickSource(
    type: 'company' | 'person' | 'opportunity',
    enrichedData: Record<string, unknown>,
  ): EnrichmentSource {
    if (type === 'company' && this.isDefined(enrichedData.linkedinLink)) return EnrichmentSource.LINKEDIN;
    if (type === 'person' && this.isDefined(enrichedData.emailDomain)) return EnrichmentSource.CLEARBIT;
    if (type === 'opportunity') return EnrichmentSource.CUSTOM;
    return EnrichmentSource.CUSTOM;
  }

  private computeDataQualityScore(enrichedData: Record<string, unknown>): number {
    const signalKeys = [
      'normalizedName',
      'domainName',
      'linkedinLink',
      'employeeCountEstimate',
      'companyName',
      'emailDomain',
      'dealHealthScore',
      'nextBestAction',
    ];

    const filled = signalKeys.filter((key) => this.isDefined(enrichedData[key])).length;
    return Math.min(100, Math.round((filled / signalKeys.length) * 100));
  }

  private getSeniority(jobTitle: string): string {
    const lower = jobTitle.toLowerCase();
    if (/(chief|ceo|cto|cfo|coo|vp|vice president)/.test(lower)) return 'executive';
    if (/(director|head|lead)/.test(lower)) return 'manager';
    if (/(manager|owner|founder)/.test(lower)) return 'decision_maker';
    return 'individual_contributor';
  }

  private computeContactScore(
    name: string,
    jobTitle: string,
    companyName: string,
    email?: string | null,
  ): number {
    let score = 30;
    if (name) score += 20;
    if (jobTitle) score += 20;
    if (companyName) score += 15;
    if (email) score += 15;
    if (/(chief|vp|director|head)/i.test(jobTitle)) score += 10;
    return Math.min(100, score);
  }

  private computeDealHealthScore(stage: string, amount: number, daysToClose: number | null): number {
    let score = 50;
    const lowerStage = stage.toLowerCase();

    if (lowerStage.includes('proposal') || lowerStage.includes('negotiation')) score += 20;
    if (lowerStage.includes('closed_won')) score += 35;
    if (lowerStage.includes('closed_lost')) score -= 35;
    if (amount > 100000) score += 10;
    if (daysToClose !== null) {
      if (daysToClose < 7) score += 10;
      else if (daysToClose > 60) score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private suggestNextAction(stage: string, amount: number): string {
    const lowerStage = stage.toLowerCase();
    if (lowerStage.includes('prospecting')) return 'Qualify the account and confirm buying committee';
    if (lowerStage.includes('qualification')) return amount > 50000 ? 'Book discovery call' : 'Send tailored discovery summary';
    if (lowerStage.includes('proposal')) return 'Send proposal recap and handle objections';
    if (lowerStage.includes('negotiation')) return 'Review contract redlines and procurement blockers';
    return 'Schedule follow-up and confirm next step';
  }

  private computeUrgency(daysToClose: number | null): string {
    if (daysToClose === null) return 'unknown';
    if (daysToClose <= 7) return 'high';
    if (daysToClose <= 30) return 'medium';
    return 'low';
  }

  private getLikelyLossReasons(stage: string, amount: number, daysToClose: number | null): string[] {
    const reasons: string[] = [];
    const lowerStage = stage.toLowerCase();
    if (lowerStage.includes('negotiation') && amount > 50000) reasons.push('Price pressure');
    if (daysToClose !== null && daysToClose > 45) reasons.push('Timing uncertainty');
    if (lowerStage.includes('proposal')) reasons.push('Competitor comparison');
    if (lowerStage.includes('closed_lost')) reasons.push('Historical loss');
    return reasons;
  }

  private normalizeDomain(value?: string | null): string | null {
    if (!value) return null;
    const cleaned = value.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
    if (cleaned.includes('.')) return cleaned.split('/')[0];
    const slug = cleaned.replace(/[^a-z0-9]+/g, '');
    return slug ? `${slug}.com` : null;
  }

  private buildLinkedInUrl(name: string, kind: 'company' | 'person'): string | null {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!slug) return null;
    return kind === 'company'
      ? `https://www.linkedin.com/company/${slug}`
      : `https://www.linkedin.com/in/${slug}`;
  }

  private estimateEmployees(name: string, domain: string | null): number {
    const seed = `${name}:${domain ?? ''}`;
    const hash = this.hash(seed);
    return 10 + (hash % 490);
  }

  private estimateRevenue(employees: number): string {
    if (employees >= 500) return '50M+';
    if (employees >= 200) return '10M-50M';
    if (employees >= 50) return '1M-10M';
    return '<1M';
  }

  private extractDomainFromEmail(email: string): string | null {
    const parts = email.split('@');
    return parts.length === 2 ? parts[1].toLowerCase() : null;
  }

  private firstEmail(emails: unknown): string | null {
    if (Array.isArray(emails)) {
      for (const email of emails) {
        if (typeof email === 'string' && email.includes('@')) return email;
        if (email && typeof email === 'object') {
          const candidate = (email as { email?: string }).email;
          if (typeof candidate === 'string' && candidate.includes('@')) return candidate;
        }
      }
    }
    return null;
  }

  private asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }

  private asNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) return Number(value);
    return null;
  }

  private asCurrencyNumber(value: unknown): number | null {
    if (typeof value === 'object' && value && 'amount' in value) {
      return this.asNumber((value as { amount?: unknown }).amount);
    }
    return this.asNumber(value);
  }

  private asDate(value: unknown): Date | null {
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
    if (typeof value === 'string') {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  }

  private titleCase(value: string): string {
    return value
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  private isDefined(value: unknown): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  private hash(value: string): number {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
    }
    return hash;
  }
}
