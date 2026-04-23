import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TargetAccountEntity, ABMCampaignEntity, AccountTier, AccountStatus } from './target-account.entity';

@Injectable()
export class ABMService {
  constructor(
    @InjectRepository(TargetAccountEntity)
    private readonly accountRepo: Repository<TargetAccountEntity>,
    @InjectRepository(ABMCampaignEntity)
    private readonly campaignRepo: Repository<ABMCampaignEntity>,
  ) {}

  async addTargetAccount(
    workspaceId: string,
    companyId: string,
    companyName: string,
    tier: AccountTier = AccountTier.SILVER,
  ): Promise<TargetAccountEntity> {
    const account = this.accountRepo.create({
      workspaceId,
      companyId,
      companyName,
      tier,
      status: AccountStatus.ACTIVE,
    });
    return this.accountRepo.save(account);
  }

  async getTargetAccounts(workspaceId: string, status?: AccountStatus): Promise<TargetAccountEntity[]> {
    const where: Record<string, unknown> = { workspaceId };
    if (status) where.status = status;
    return this.accountRepo.find({ where });
  }

  async updateAccountTier(id: string, tier: AccountTier): Promise<TargetAccountEntity> {
    await this.accountRepo.update(id, { tier });
    const account = await this.accountRepo.findOne({ where: { id } });
    if (!account) throw new NotFoundException(`Target account ${id} not found`);
    return account;
  }

  async addKeyContact(
    accountId: string,
    contact: { id: string; name: string; role: string },
  ): Promise<TargetAccountEntity> {
    const account = await this.accountRepo.findOne({ where: { id: accountId } });
    if (!account) throw new NotFoundException(`Target account ${accountId} not found`);

    const keyContacts = Array.isArray(account.keyContacts) ? [...account.keyContacts] : [];
    const existingIndex = keyContacts.findIndex((item) => item.id === contact.id);

    if (existingIndex >= 0) keyContacts[existingIndex] = contact;
    else keyContacts.push(contact);

    account.keyContacts = keyContacts;
    account.status = AccountStatus.ACTIVE;
    return this.accountRepo.save(account);
  }

  async setDecisionMakers(accountId: string, decisionMakers: string[]): Promise<TargetAccountEntity> {
    await this.accountRepo.update(accountId, { decisionMakers });
    const account = await this.accountRepo.findOne({ where: { id: accountId } });
    if (!account) throw new NotFoundException(`Target account ${accountId} not found`);
    return account;
  }

  async recordEngagement(
    accountId: string,
    engagement: {
      type: string;
      value?: number;
      notes?: string;
      at?: Date;
    },
  ): Promise<TargetAccountEntity> {
    const account = await this.accountRepo.findOne({ where: { id: accountId } });
    if (!account) throw new NotFoundException(`Target account ${accountId} not found`);

    const history = this.normalizeEngagementHistory(account.engagementHistory);
    const entry = {
      type: engagement.type,
      value: engagement.value ?? 0,
      notes: engagement.notes ?? null,
      at: (engagement.at ?? new Date()).toISOString(),
    };

    history.events.push(entry);
    history.lastEngagedAt = entry.at;
    history.engagementScore = this.calculateEngagementScore({
      keyContacts: account.keyContacts ?? [],
      decisionMakers: account.decisionMakers ?? [],
      totalRevenue: account.totalRevenue ?? 0,
      opportunityCount: account.opportunityCount ?? 0,
      history,
    });

    account.engagementHistory = history;
    return this.accountRepo.save(account);
  }

  async updateAccountMetrics(
    accountId: string,
    updates: Partial<Pick<TargetAccountEntity, 'totalRevenue' | 'opportunityCount' | 'notes'>>,
  ): Promise<TargetAccountEntity> {
    await this.accountRepo.update(accountId, updates);
    const account = await this.accountRepo.findOne({ where: { id: accountId } });
    if (!account) throw new NotFoundException(`Target account ${accountId} not found`);
    return account;
  }

  async computeEngagementScore(accountId: string): Promise<number> {
    const account = await this.accountRepo.findOne({ where: { id: accountId } });
    if (!account) return 0;

    const history = this.normalizeEngagementHistory(account.engagementHistory);
    return this.calculateEngagementScore({
      keyContacts: account.keyContacts ?? [],
      decisionMakers: account.decisionMakers ?? [],
      totalRevenue: account.totalRevenue ?? 0,
      opportunityCount: account.opportunityCount ?? 0,
      history,
    });
  }

  async createCampaign(
    workspaceId: string,
    name: string,
    targetTier?: AccountTier,
  ): Promise<ABMCampaignEntity> {
    const campaign = this.campaignRepo.create({
      workspaceId,
      name,
      targetTier,
      isActive: true,
    });
    return this.campaignRepo.save(campaign);
  }

  async getCampaigns(workspaceId: string): Promise<ABMCampaignEntity[]> {
    return this.campaignRepo.find({ where: { workspaceId }, order: { createdAt: 'DESC' } });
  }

  async enrollAccounts(campaignId: string, accountIds: string[]): Promise<void> {
    await this.campaignRepo.update(campaignId, {
      targetAccountIds: accountIds,
      enrolledCount: accountIds.length,
    });
  }

  async getTargetAccountSummary(workspaceId: string): Promise<{
    accounts: number;
    activeAccounts: number;
    totalRevenue: number;
    opportunityCount: number;
    averageEngagementScore: number;
  }> {
    const accounts = await this.accountRepo.find({ where: { workspaceId } });
    const totalRevenue = accounts.reduce((sum, account) => sum + (account.totalRevenue ?? 0), 0);
    const opportunityCount = accounts.reduce((sum, account) => sum + (account.opportunityCount ?? 0), 0);
    const averageEngagementScore = accounts.length
      ? Math.round(
          accounts.reduce((sum, account) => sum + this.calculateEngagementScore({
            keyContacts: account.keyContacts ?? [],
            decisionMakers: account.decisionMakers ?? [],
            totalRevenue: account.totalRevenue ?? 0,
            opportunityCount: account.opportunityCount ?? 0,
            history: this.normalizeEngagementHistory(account.engagementHistory),
          }), 0) / accounts.length,
        )
      : 0;

    return {
      accounts: accounts.length,
      activeAccounts: accounts.filter((account) => account.status === AccountStatus.ACTIVE).length,
      totalRevenue,
      opportunityCount,
      averageEngagementScore,
    };
  }

  private normalizeEngagementHistory(
    history: Record<string, unknown> | null | undefined,
  ): { events: Array<{ type: string; value: number; notes: string | null; at: string }>; lastEngagedAt?: string; engagementScore?: number } {
    const base = history && typeof history === 'object' ? history : {};
    const events = Array.isArray((base as Record<string, unknown>).events)
      ? ((base as Record<string, unknown>).events as Array<{ type: string; value: number; notes: string | null; at: string }>)
      : [];

    return {
      events,
      lastEngagedAt: typeof (base as Record<string, unknown>).lastEngagedAt === 'string'
        ? (base as Record<string, unknown>).lastEngagedAt as string
        : undefined,
      engagementScore: typeof (base as Record<string, unknown>).engagementScore === 'number'
        ? (base as Record<string, unknown>).engagementScore as number
        : undefined,
    };
  }

  private calculateEngagementScore(input: {
    keyContacts: Array<{ id: string; name: string; role: string }>;
    decisionMakers: string[];
    totalRevenue: number;
    opportunityCount: number;
    history: { events: Array<{ type: string; value: number; notes: string | null; at: string }> };
  }): number {
    const recentEvents = input.history.events.slice(-10);
    const eventScore = recentEvents.reduce((sum, event) => {
      const weight = event.type === 'meeting' ? 8 : event.type === 'email' ? 4 : event.type === 'opportunity' ? 10 : 3;
      return sum + weight + Math.min(10, Math.max(0, Math.round((event.value ?? 0) / 1000)));
    }, 0);

    const contactScore = Math.min(25, (input.keyContacts.length || 0) * 6);
    const decisionMakerScore = Math.min(20, (input.decisionMakers.length || 0) * 5);
    const revenueScore = Math.min(20, Math.round((input.totalRevenue || 0) / 5000));
    const opportunityScore = Math.min(15, (input.opportunityCount || 0) * 3);

    return Math.max(
      0,
      Math.min(100, contactScore + decisionMakerScore + revenueScore + opportunityScore + Math.min(20, eventScore)),
    );
  }
}
