import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  PartnerEntity, DealRegistrationEntity, MDFRequestEntity, PartnerSPIFFEntity, PartnerCommunicationEntity,
  PartnerTier, PartnerStatus, DealRegStatus, MDFStatus,
} from './prm.entity';

@Injectable()
export class PRMService {
  constructor(
    @InjectRepository(PartnerEntity) private readonly partnerRepo: Repository<PartnerEntity>,
    @InjectRepository(DealRegistrationEntity) private readonly dealRegRepo: Repository<DealRegistrationEntity>,
    @InjectRepository(MDFRequestEntity) private readonly mdfRepo: Repository<MDFRequestEntity>,
    @InjectRepository(PartnerSPIFFEntity) private readonly spiffRepo: Repository<PartnerSPIFFEntity>,
    @InjectRepository(PartnerCommunicationEntity) private readonly commRepo: Repository<PartnerCommunicationEntity>,
  ) {}

  // ==================== PARTNER LIFECYCLE ====================
  async recruitPartner(workspaceId: string, data: Partial<PartnerEntity>): Promise<PartnerEntity> {
    return this.partnerRepo.save(this.partnerRepo.create({ workspaceId, status: PartnerStatus.PROSPECT, ...data }));
  }

  async onboardPartner(partnerId: string): Promise<PartnerEntity> {
    const p = await this.findPartnerOrFail(partnerId);
    p.status = PartnerStatus.ONBOARDING;
    p.onboardingChecklist = [
      { task: 'Portal access granted', completed: false },
      { task: 'LMS courses assigned', completed: false },
      { task: 'Channel manager intro', completed: false },
      { task: 'First deal registered', completed: false },
    ];
    return this.partnerRepo.save(p);
  }

  async activatePartner(partnerId: string, tier: PartnerTier): Promise<PartnerEntity> {
    const p = await this.findPartnerOrFail(partnerId);
    p.status = PartnerStatus.ACTIVE;
    p.tier = tier;
    p.commissionRate = tier === PartnerTier.PLATINUM ? 20 : tier === PartnerTier.GOLD ? 15 : tier === PartnerTier.SILVER ? 10 : 5;
    return this.partnerRepo.save(p);
  }

  async calculateHealthScore(partnerId: string): Promise<{ score: number; factors: Record<string, number> }> {
    const p = await this.findPartnerOrFail(partnerId);
    const factors: Record<string, number> = {
      dealsActive: Math.min(25, p.activeDeals * 5),
      revenue: Math.min(25, Number(p.totalRevenue) > 100_000_000 ? 25 : (Number(p.totalRevenue) / 100_000_000) * 25),
      training: Math.min(25, p.coursesCompleted * 5),
      engagement: Math.min(25, p.points / 100 * 25),
    };
    p.healthScore = Object.values(factors).reduce((s, v) => s + v, 0);
    await this.partnerRepo.save(p);
    return { score: p.healthScore, factors };
  }

  async evaluateTierUpgrade(workspaceId: string): Promise<Array<{ partnerId: string; currentTier: PartnerTier; suggestedTier: PartnerTier; reason: string }>> {
    const partners = await this.partnerRepo.find({ where: { workspaceId, status: PartnerStatus.ACTIVE } });
    const suggestions: Array<{ partnerId: string; currentTier: PartnerTier; suggestedTier: PartnerTier; reason: string }> = [];
    for (const p of partners) {
      if (p.tier !== PartnerTier.PLATINUM && p.wonDeals >= 20 && Number(p.totalRevenue) > 500_000_000) {
        suggestions.push({ partnerId: p.id, currentTier: p.tier, suggestedTier: PartnerTier.PLATINUM, reason: `${p.wonDeals} deals, ${Number(p.totalRevenue).toLocaleString()} revenue` });
      } else if (p.tier === PartnerTier.BRONZE && p.wonDeals >= 5) {
        suggestions.push({ partnerId: p.id, currentTier: p.tier, suggestedTier: PartnerTier.SILVER, reason: `${p.wonDeals} deals closed` });
      }
    }
    return suggestions;
  }

  // ==================== DEAL REGISTRATION ====================
  async registerDeal(workspaceId: string, partnerId: string, data: Partial<DealRegistrationEntity>): Promise<DealRegistrationEntity> {
    // Check for conflicts
    const existing = await this.dealRegRepo.findOne({
      where: { workspaceId, prospectCompanyName: data.prospectCompanyName, status: In([DealRegStatus.PENDING, DealRegStatus.APPROVED]) },
    });

    const reg = this.dealRegRepo.create({
      workspaceId, partnerId, ...data,
      expiryDate: new Date(Date.now() + (data.exclusivityDays ?? 90) * 86_400_000),
    });

    if (existing && existing.partnerId !== partnerId) {
      reg.conflictingPartnerId = existing.partnerId;
      reg.conflictResolution = 'pending_review';
    }

    const saved = await this.dealRegRepo.save(reg);
    await this.partnerRepo.increment({ id: partnerId }, 'activeDeals', 1);
    return saved;
  }

  async approveDealRegistration(regId: string, approverId: string): Promise<DealRegistrationEntity> {
    const reg = await this.dealRegRepo.findOne({ where: { id: regId } });
    if (!reg) throw new NotFoundException(`Deal registration ${regId} not found`);
    reg.status = DealRegStatus.APPROVED;
    reg.approverId = approverId;
    return this.dealRegRepo.save(reg);
  }

  async wonDealRegistration(regId: string, dealId: string, dealAmount: number): Promise<DealRegistrationEntity> {
    const reg = await this.dealRegRepo.findOne({ where: { id: regId } });
    if (!reg) throw new NotFoundException(`Deal registration ${regId} not found`);
    reg.status = DealRegStatus.WON;
    reg.dealId = dealId;

    const partner = await this.findPartnerOrFail(reg.partnerId);
    partner.wonDeals++;
    partner.totalRevenue = Number(partner.totalRevenue) + dealAmount;
    const spiffAmount = dealAmount * (Number(partner.commissionRate) / 100);
    partner.totalCommissionPaid = Number(partner.totalCommissionPaid) + spiffAmount;
    await this.partnerRepo.save(partner);

    await this.spiffRepo.save(this.spiffRepo.create({
      workspaceId: reg.workspaceId, partnerId: reg.partnerId, dealId,
      dealAmount, spiffRate: Number(partner.commissionRate), spiffAmount,
    }));

    return this.dealRegRepo.save(reg);
  }

  async getPartnerPipeline(workspaceId: string, partnerId?: string): Promise<DealRegistrationEntity[]> {
    const where: Record<string, unknown> = { workspaceId };
    if (partnerId) where['partnerId'] = partnerId;
    return this.dealRegRepo.find({ where: where as any, order: { createdAt: 'DESC' } });
  }

  // ==================== MDF & INCENTIVES ====================
  async requestMDF(workspaceId: string, partnerId: string, data: Partial<MDFRequestEntity>): Promise<MDFRequestEntity> {
    return this.mdfRepo.save(this.mdfRepo.create({ workspaceId, partnerId, ...data }));
  }

  async approveMDF(mdfId: string, approverId: string, amountApproved: number): Promise<MDFRequestEntity> {
    const mdf = await this.mdfRepo.findOne({ where: { id: mdfId } });
    if (!mdf) throw new NotFoundException(`MDF ${mdfId} not found`);
    mdf.status = MDFStatus.APPROVED;
    mdf.approverId = approverId;
    mdf.amountApproved = amountApproved;
    return this.mdfRepo.save(mdf);
  }

  async reconcileMDF(mdfId: string, spent: number, leads: number, revenue: number): Promise<MDFRequestEntity> {
    const mdf = await this.mdfRepo.findOne({ where: { id: mdfId } });
    if (!mdf) throw new NotFoundException(`MDF ${mdfId} not found`);
    mdf.status = MDFStatus.RECONCILED;
    mdf.amountSpent = spent;
    mdf.leadsGenerated = leads;
    mdf.revenueGenerated = revenue;
    return this.mdfRepo.save(mdf);
  }

  async awardBadge(partnerId: string, badge: string): Promise<PartnerEntity> {
    const p = await this.findPartnerOrFail(partnerId);
    const badges = p.badges ?? [];
    if (!badges.includes(badge)) { badges.push(badge); p.badges = badges; p.points += 100; }
    return this.partnerRepo.save(p);
  }

  // ==================== COMMUNICATIONS ====================
  async publishCommunication(workspaceId: string, data: Partial<PartnerCommunicationEntity>): Promise<PartnerCommunicationEntity> {
    const partners = await this.partnerRepo.find({ where: { workspaceId, status: PartnerStatus.ACTIVE } });
    const filtered = data.targetTiers?.length ? partners.filter((p) => data.targetTiers!.includes(p.tier)) : partners;
    return this.commRepo.save(this.commRepo.create({ workspaceId, ...data, totalRecipients: filtered.length }));
  }

  // ==================== ANALYTICS ====================
  async getChannelAnalytics(workspaceId: string): Promise<{
    totalPartners: number; activePartners: number; channelRevenue: number; directRevenue: number;
    avgDealSize: number; mdfROI: number; topPartners: Array<{ id: string; name: string; revenue: number; deals: number }>;
    byTier: Record<string, { count: number; revenue: number }>;
    sourcedVsInfluenced: { sourced: number; influenced: number };
  }> {
    const partners = await this.partnerRepo.find({ where: { workspaceId } });
    const active = partners.filter((p) => p.status === PartnerStatus.ACTIVE);
    const channelRevenue = partners.reduce((s, p) => s + Number(p.totalRevenue), 0);
    const totalDeals = partners.reduce((s, p) => s + p.wonDeals, 0);
    const mdfs = await this.mdfRepo.find({ where: { workspaceId, status: MDFStatus.RECONCILED } });
    const mdfSpent = mdfs.reduce((s, m) => s + Number(m.amountSpent), 0);
    const mdfRevenue = mdfs.reduce((s, m) => s + Number(m.revenueGenerated), 0);

    const byTier: Record<string, { count: number; revenue: number }> = {};
    for (const p of active) {
      if (!byTier[p.tier]) byTier[p.tier] = { count: 0, revenue: 0 };
      byTier[p.tier].count++;
      byTier[p.tier].revenue += Number(p.totalRevenue);
    }

    const regs = await this.dealRegRepo.find({ where: { workspaceId, status: DealRegStatus.WON } });

    return {
      totalPartners: partners.length, activePartners: active.length,
      channelRevenue, directRevenue: 0,
      avgDealSize: totalDeals ? channelRevenue / totalDeals : 0,
      mdfROI: mdfSpent ? Math.round((mdfRevenue / mdfSpent) * 100) : 0,
      topPartners: active.sort((a, b) => Number(b.totalRevenue) - Number(a.totalRevenue)).slice(0, 10).map((p) => ({ id: p.id, name: p.companyName, revenue: Number(p.totalRevenue), deals: p.wonDeals })),
      byTier,
      sourcedVsInfluenced: { sourced: regs.length, influenced: 0 },
    };
  }

  async getPartnerLeaderboard(workspaceId: string): Promise<Array<{ rank: number; partnerId: string; name: string; tier: PartnerTier; points: number; deals: number; badges: string[] }>> {
    const partners = await this.partnerRepo.find({ where: { workspaceId, status: PartnerStatus.ACTIVE }, order: { points: 'DESC' } });
    return partners.map((p, i) => ({ rank: i + 1, partnerId: p.id, name: p.companyName, tier: p.tier, points: p.points, deals: p.wonDeals, badges: p.badges ?? [] }));
  }

  private async findPartnerOrFail(partnerId: string): Promise<PartnerEntity> {
    const p = await this.partnerRepo.findOne({ where: { id: partnerId } });
    if (!p) throw new NotFoundException(`Partner ${partnerId} not found`);
    return p;
  }
}
