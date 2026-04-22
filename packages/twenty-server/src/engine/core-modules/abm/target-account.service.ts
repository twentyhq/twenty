import { Injectable } from '@nestjs/common';
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
    return this.accountRepo.findOne({ where: { id } });
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
    await this.campaignRepo.update(campaignId, { targetAccountIds: accountIds });
  }
}