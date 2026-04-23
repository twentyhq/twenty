import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerHealthEntity, NPSSurveyEntity, HealthStatus } from './health-score.entity';
import {
  CustomerSuccessPlaybookEntity,
  CustomerSuccessPlaybookStatus,
  ExpansionRevenueEntity,
  ExpansionRevenueStatus,
  ExpansionRevenueType,
  QBRRecordEntity,
  QBRStatus,
} from './customer-success-programs.entity';

@Injectable()
export class CustomerSuccessService {
  constructor(
    @InjectRepository(CustomerHealthEntity)
    private readonly healthRepo: Repository<CustomerHealthEntity>,
    @InjectRepository(NPSSurveyEntity)
    private readonly npsRepo: Repository<NPSSurveyEntity>,
    @InjectRepository(CustomerSuccessPlaybookEntity)
    private readonly playbookRepo: Repository<CustomerSuccessPlaybookEntity>,
    @InjectRepository(QBRRecordEntity)
    private readonly qbrRepo: Repository<QBRRecordEntity>,
    @InjectRepository(ExpansionRevenueEntity)
    private readonly expansionRepo: Repository<ExpansionRevenueEntity>,
  ) {}

  async computeHealth(workspaceId: string, accountId: string, metrics: Record<string, number>): Promise<CustomerHealthEntity> {
    let score = 100;
    const risks: string[] = [];

    if (metrics.supportTickets > 10) { score -= 20; risks.push('High support tickets'); }
    if (metrics.loginFrequency < 2) { score -= 15; risks.push('Low engagement'); }
    if (metrics.npsScore && metrics.npsScore < 5) { score -= 25; risks.push('Low NPS'); }
    if (metrics.paymentFailed) { score -= 30; risks.push('Payment issues'); }
    if (metrics.contractRenewal < 30) { score -= 20; risks.push('Upcoming renewal'); }

    let status = HealthStatus.HEALTHY;
    if (score < 40) status = HealthStatus.CRITICAL;
    else if (score < 70) status = HealthStatus.AT_RISK;

    const health = this.healthRepo.create({
      workspaceId,
      accountId,
      healthScore: score,
      status,
      metrics,
      riskFactors: risks,
      recommendations: this.generateRecommendations(status),
    });

    return this.healthRepo.save(health);
  }

  async getHealth(workspaceId: string, accountId: string): Promise<CustomerHealthEntity | null> {
    return this.healthRepo.findOne({ where: { workspaceId, accountId } });
  }

  async sendNPS(workspaceId: string, accountId: string): Promise<NPSSurveyEntity> {
    const survey = this.npsRepo.create({ workspaceId, accountId, score: 0, responded: false });
    return this.npsRepo.save(survey);
  }

  async recordNPS(id: string, score: number, feedback?: string): Promise<NPSSurveyEntity> {
    await this.npsRepo.update(id, { score, feedback, responded: true });
    const survey = await this.npsRepo.findOne({ where: { id } });
    if (!survey) throw new NotFoundException(`NPS survey ${id} not found`);
    return survey;
  }

  async createPlaybook(
    workspaceId: string,
    data: Partial<CustomerSuccessPlaybookEntity>,
  ): Promise<CustomerSuccessPlaybookEntity> {
    const playbook = this.playbookRepo.create({
      ...data,
      workspaceId,
      status: data.status ?? CustomerSuccessPlaybookStatus.DRAFT,
      progress: data.progress ?? 0,
      steps: data.steps ?? [],
      triggers: data.triggers ?? [],
    });
    return this.playbookRepo.save(playbook);
  }

  async listPlaybooks(workspaceId: string, accountId?: string): Promise<CustomerSuccessPlaybookEntity[]> {
    const where: Record<string, unknown> = { workspaceId };
    if (accountId) where.accountId = accountId;
    return this.playbookRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async updatePlaybook(
    id: string,
    updates: Partial<CustomerSuccessPlaybookEntity>,
  ): Promise<CustomerSuccessPlaybookEntity> {
    await this.playbookRepo.update(id, updates);
    const playbook = await this.playbookRepo.findOne({ where: { id } });
    if (!playbook) throw new NotFoundException(`Playbook ${id} not found`);
    return playbook;
  }

  async completePlaybook(id: string): Promise<CustomerSuccessPlaybookEntity> {
    await this.playbookRepo.update(id, {
      status: CustomerSuccessPlaybookStatus.COMPLETED,
      progress: 100,
    });
    const playbook = await this.playbookRepo.findOne({ where: { id } });
    if (!playbook) throw new NotFoundException(`Playbook ${id} not found`);
    return playbook;
  }

  async scheduleQBR(
    workspaceId: string,
    accountId: string,
    scheduledAt: Date,
    attendees: string[] = [],
    actionItems: string[] = [],
  ): Promise<QBRRecordEntity> {
    const qbr = this.qbrRepo.create({
      workspaceId,
      accountId,
      scheduledAt,
      attendees,
      actionItems,
      status: QBRStatus.SCHEDULED,
    });
    return this.qbrRepo.save(qbr);
  }

  async listQBRs(workspaceId: string, accountId?: string): Promise<QBRRecordEntity[]> {
    const where: Record<string, unknown> = { workspaceId };
    if (accountId) where.accountId = accountId;
    return this.qbrRepo.find({ where, order: { scheduledAt: 'DESC' } });
  }

  async completeQBR(
    id: string,
    summary: string,
    actionItems: string[] = [],
  ): Promise<QBRRecordEntity> {
    await this.qbrRepo.update(id, {
      summary,
      actionItems,
      completedAt: new Date(),
      status: QBRStatus.COMPLETED,
    });
    const qbr = await this.qbrRepo.findOne({ where: { id } });
    if (!qbr) throw new NotFoundException(`QBR ${id} not found`);
    return qbr;
  }

  async trackExpansionRevenue(
    workspaceId: string,
    accountId: string,
    amount: number,
    type: ExpansionRevenueType = ExpansionRevenueType.UPSELL,
    options: {
      dealId?: string;
      notes?: string;
      status?: ExpansionRevenueStatus;
      recognizedAt?: Date;
    } = {},
  ): Promise<ExpansionRevenueEntity> {
    const expansion = this.expansionRepo.create({
      workspaceId,
      accountId,
      amount,
      type,
      dealId: options.dealId ?? null,
      notes: options.notes ?? null,
      status: options.status ?? ExpansionRevenueStatus.FORECASTED,
      recognizedAt: options.recognizedAt ?? new Date(),
    });
    return this.expansionRepo.save(expansion);
  }

  async getExpansionRevenueSummary(workspaceId: string, accountId?: string): Promise<{
    totalAmount: number;
    realizedAmount: number;
    forecastedAmount: number;
    byType: Record<ExpansionRevenueType, number>;
    byStatus: Record<ExpansionRevenueStatus, number>;
    recordCount: number;
  }> {
    const where: Record<string, unknown> = { workspaceId };
    if (accountId) where.accountId = accountId;

    const records = await this.expansionRepo.find({ where });
    const summary = {
      totalAmount: 0,
      realizedAmount: 0,
      forecastedAmount: 0,
      byType: {
        [ExpansionRevenueType.UPSELL]: 0,
        [ExpansionRevenueType.CROSS_SELL]: 0,
        [ExpansionRevenueType.RENEWAL]: 0,
      },
      byStatus: {
        [ExpansionRevenueStatus.FORECASTED]: 0,
        [ExpansionRevenueStatus.COMMITTED]: 0,
        [ExpansionRevenueStatus.REALIZED]: 0,
      },
      recordCount: records.length,
    };

    for (const record of records) {
      summary.totalAmount += record.amount ?? 0;
      summary.byType[record.type] += record.amount ?? 0;
      summary.byStatus[record.status] += record.amount ?? 0;
      if (record.status === ExpansionRevenueStatus.REALIZED) {
        summary.realizedAmount += record.amount ?? 0;
      }
      if (record.status === ExpansionRevenueStatus.FORECASTED) {
        summary.forecastedAmount += record.amount ?? 0;
      }
    }

    return summary;
  }

  async getCustomerSuccessSummary(workspaceId: string, accountId: string): Promise<{
    health: CustomerHealthEntity | null;
    playbookCount: number;
    activePlaybookCount: number;
    qbrCount: number;
    upcomingQbrCount: number;
    expansionRevenue: Awaited<ReturnType<CustomerSuccessService['getExpansionRevenueSummary']>>;
  }> {
    const [health, playbooks, qbrs, expansionRevenue] = await Promise.all([
      this.getHealth(workspaceId, accountId),
      this.listPlaybooks(workspaceId, accountId),
      this.listQBRs(workspaceId, accountId),
      this.getExpansionRevenueSummary(workspaceId, accountId),
    ]);

    const now = new Date();

    return {
      health,
      playbookCount: playbooks.length,
      activePlaybookCount: playbooks.filter((playbook) => playbook.status === CustomerSuccessPlaybookStatus.ACTIVE).length,
      qbrCount: qbrs.length,
      upcomingQbrCount: qbrs.filter((qbr) => qbr.status === QBRStatus.SCHEDULED && qbr.scheduledAt > now).length,
      expansionRevenue,
    };
  }

  private generateRecommendations(status: HealthStatus): string[] {
    switch (status) {
      case HealthStatus.CRITICAL:
        return ['Schedule executive review', 'Assign dedicated CSM', 'Offer incentives'];
      case HealthStatus.AT_RISK:
        return ['Schedule check-in call', 'Share success stories', 'Review product usage'];
      default:
        return ['Continue engagement', 'Identify expansion opportunities'];
    }
  }
}
