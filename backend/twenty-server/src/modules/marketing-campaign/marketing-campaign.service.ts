import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MarketingCampaignEntity,
  LeadScoreRuleEntity,
  LeadScoreEntity,
  CampaignTouchpointEntity,
  CampaignStatus,
  LeadScoreAction,
} from './marketing-campaign.entity';

@Injectable()
export class MarketingCampaignService {
  constructor(
    @InjectRepository(MarketingCampaignEntity)
    private readonly campaignRepo: Repository<MarketingCampaignEntity>,
    @InjectRepository(LeadScoreRuleEntity)
    private readonly scoreRuleRepo: Repository<LeadScoreRuleEntity>,
    @InjectRepository(LeadScoreEntity)
    private readonly leadScoreRepo: Repository<LeadScoreEntity>,
    @InjectRepository(CampaignTouchpointEntity)
    private readonly touchpointRepo: Repository<CampaignTouchpointEntity>,
  ) {}

  async createCampaign(
    workspaceId: string,
    data: Partial<MarketingCampaignEntity>,
  ): Promise<MarketingCampaignEntity> {
    return this.campaignRepo.save(this.campaignRepo.create({ workspaceId, ...data }));
  }

  async launchCampaign(campaignId: string): Promise<MarketingCampaignEntity> {
    const campaign = await this.findCampaignOrFail(campaignId);
    campaign.status = CampaignStatus.ACTIVE;
    campaign.startDate = campaign.startDate ?? new Date();
    return this.campaignRepo.save(campaign);
  }

  async recordEngagement(
    campaignId: string,
    field: 'delivered' | 'opened' | 'clicked' | 'converted',
    count = 1,
  ): Promise<void> {
    await this.campaignRepo.increment({ id: campaignId }, field, count);
  }

  async createScoreRule(
    workspaceId: string,
    action: LeadScoreAction,
    points: number,
  ): Promise<LeadScoreRuleEntity> {
    return this.scoreRuleRepo.save(this.scoreRuleRepo.create({ workspaceId, action, points }));
  }

  async processLeadAction(workspaceId: string, contactId: string, action: LeadScoreAction): Promise<LeadScoreEntity> {
    const rules = await this.scoreRuleRepo.find({ where: { workspaceId, action, isActive: true } });
    const points = rules.reduce((sum, r) => sum + r.points, 0);
    if (points === 0) {
      return this.getOrCreateScore(workspaceId, contactId);
    }

    const score = await this.getOrCreateScore(workspaceId, contactId);
    score.totalScore += points;
    const breakdown = score.scoreBreakdown ?? {};
    breakdown[action] = (breakdown[action] ?? 0) + points;
    score.scoreBreakdown = breakdown;

    score.tier = score.totalScore >= 80 ? 'hot' : score.totalScore >= 40 ? 'warm' : 'cold';

    if (score.totalScore >= 60 && !score.isMQL) {
      score.isMQL = true;
      score.mqlAt = new Date();
    }

    return this.leadScoreRepo.save(score);
  }

  async handoffToSales(workspaceId: string, contactId: string): Promise<LeadScoreEntity> {
    const score = await this.getOrCreateScore(workspaceId, contactId);
    score.isSQL = true;
    score.sqlHandoffAt = new Date();
    return this.leadScoreRepo.save(score);
  }

  async applyScoreDecay(workspaceId: string): Promise<number> {
    const scores = await this.leadScoreRepo.find({ where: { workspaceId } });
    let decayed = 0;
    for (const score of scores) {
      const daysSinceUpdate = (Date.now() - score.updatedAt.getTime()) / 86_400_000;
      if (daysSinceUpdate > 7 && score.totalScore > 0) {
        score.totalScore = Math.max(0, score.totalScore - Math.floor(daysSinceUpdate));
        score.tier = score.totalScore >= 80 ? 'hot' : score.totalScore >= 40 ? 'warm' : 'cold';
        await this.leadScoreRepo.save(score);
        decayed++;
      }
    }
    return decayed;
  }

  async recordTouchpoint(
    workspaceId: string,
    data: { campaignId: string; contactId: string; touchType: string; dealId?: string; utmSource?: string; utmMedium?: string; utmCampaign?: string },
  ): Promise<CampaignTouchpointEntity> {
    return this.touchpointRepo.save(this.touchpointRepo.create({ workspaceId, ...data }));
  }

  async calculateMultiTouchAttribution(workspaceId: string, dealId: string, revenueAmount: number): Promise<void> {
    const touchpoints = await this.touchpointRepo.find({ where: { workspaceId, dealId }, order: { createdAt: 'ASC' } });
    if (!touchpoints.length) return;

    const weight = 1 / touchpoints.length;
    for (const tp of touchpoints) {
      tp.attributionWeight = weight;
      tp.revenueAttributed = revenueAmount * weight;
      await this.touchpointRepo.save(tp);
    }

    const campaignIds = [...new Set(touchpoints.map((t) => t.campaignId))];
    for (const campaignId of campaignIds) {
      const campaignTouchpoints = touchpoints.filter((t) => t.campaignId === campaignId);
      const attributed = campaignTouchpoints.reduce((s, t) => s + Number(t.revenueAttributed), 0);
      await this.campaignRepo.increment({ id: campaignId }, 'revenueAttributed', attributed);
      await this.campaignRepo.increment({ id: campaignId }, 'dealsCreated', 1);
    }
  }

  async getCampaignROI(campaignId: string): Promise<{ cpl: number; cpo: number; roi: number }> {
    const campaign = await this.findCampaignOrFail(campaignId);
    const spent = Number(campaign.spent) || 1;
    return {
      cpl: campaign.leadsGenerated ? spent / campaign.leadsGenerated : 0,
      cpo: campaign.dealsCreated ? spent / campaign.dealsCreated : 0,
      roi: ((Number(campaign.revenueAttributed) - spent) / spent) * 100,
    };
  }

  private async getOrCreateScore(workspaceId: string, contactId: string): Promise<LeadScoreEntity> {
    let score = await this.leadScoreRepo.findOne({ where: { workspaceId, contactId } });
    if (!score) {
      score = this.leadScoreRepo.create({ workspaceId, contactId, totalScore: 0, scoreBreakdown: {} });
    }
    return score;
  }

  private async findCampaignOrFail(campaignId: string): Promise<MarketingCampaignEntity> {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException(`Campaign ${campaignId} not found`);
    return campaign;
  }
}
