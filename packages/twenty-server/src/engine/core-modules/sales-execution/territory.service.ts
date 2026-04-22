import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesTerritoryEntity, SalesQuotaEntity, QuotaStatus } from './territory.entity';

@Injectable()
export class SalesExecutionService {
  constructor(
    @InjectRepository(SalesTerritoryEntity)
    private readonly territoryRepo: Repository<SalesTerritoryEntity>,
    @InjectRepository(SalesQuotaEntity)
    private readonly quotaRepo: Repository<SalesQuotaEntity>,
  ) {}

  async createTerritory(workspaceId: string, data: Partial<SalesTerritoryEntity>): Promise<SalesTerritoryEntity> {
    const territory = this.territoryRepo.create({ ...data, workspaceId });
    return this.territoryRepo.save(territory);
  }

  async getTerritories(workspaceId: string): Promise<SalesTerritoryEntity[]> {
    return this.territoryRepo.find({ where: { workspaceId } });
  }

  async assignQuota(workspaceId: string, userId: string, period: string, amount: number): Promise<SalesQuotaEntity> {
    const quota = this.quotaRepo.create({ workspaceId, userId, period, targetAmount: amount });
    return this.quotaRepo.save(quota);
  }

  async updateProgress(quotaId: string, achieved: number): Promise<SalesQuotaEntity> {
    const quota = await this.quotaRepo.findOne({ where: { id: quotaId } });
    if (!quota) return null;

    quota.achievedAmount = achieved;
    const pct = (achieved / quota.targetAmount) * 100;
    if (pct >= 100) quota.status = QuotaStatus.ACHIEVED;
    else if (pct >= 75) quota.status = QuotaStatus.ON_TRACK;
    else if (pct >= 50) quota.status = QuotaStatus.AT_RISK;
    else quota.status = QuotaStatus.BEHIND;

    return this.quotaRepo.save(quota);
  }

  async getQuotaStatus(workspaceId: string, userId: string, period: string): Promise<SalesQuotaEntity | null> {
    return this.quotaRepo.findOne({ where: { workspaceId, userId, period } });
  }
}