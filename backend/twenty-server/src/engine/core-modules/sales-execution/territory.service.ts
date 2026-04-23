import { Injectable, NotFoundException } from '@nestjs/common';
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

  async updateTerritory(
    territoryId: string,
    updates: Partial<SalesTerritoryEntity>,
  ): Promise<SalesTerritoryEntity> {
    await this.territoryRepo.update(territoryId, updates);
    const territory = await this.territoryRepo.findOne({ where: { id: territoryId } });
    if (!territory) throw new NotFoundException(`Territory ${territoryId} not found`);
    return territory;
  }

  async updateTerritoryQuota(territoryId: string, quota: number): Promise<SalesTerritoryEntity> {
    return this.updateTerritory(territoryId, { quota });
  }

  async setTerritoryAssignees(territoryId: string, assignees: string[]): Promise<SalesTerritoryEntity> {
    return this.updateTerritory(territoryId, { assignees });
  }

  async getTerritorySummary(workspaceId: string): Promise<{
    territories: number;
    totalQuota: number;
    averageQuota: number;
    assignedTerritories: number;
    regions: number;
    industries: number;
  }> {
    const territories = await this.territoryRepo.find({ where: { workspaceId } });

    const totalQuota = territories.reduce((sum, territory) => sum + (territory.quota ?? 0), 0);
    const assignedTerritories = territories.filter((territory) => (territory.assignees ?? []).length > 0).length;

    const regions = new Set<string>();
    const industries = new Set<string>();

    for (const territory of territories) {
      for (const region of territory.regions ?? []) regions.add(region);
      for (const industry of territory.industries ?? []) industries.add(industry);
    }

    return {
      territories: territories.length,
      totalQuota,
      averageQuota: territories.length ? Math.round(totalQuota / territories.length) : 0,
      assignedTerritories,
      regions: regions.size,
      industries: industries.size,
    };
  }

  async assignQuota(workspaceId: string, userId: string, period: string, amount: number): Promise<SalesQuotaEntity> {
    const quota = this.quotaRepo.create({ workspaceId, userId, period, targetAmount: amount });
    return this.quotaRepo.save(quota);
  }

  async updateProgress(quotaId: string, achieved: number): Promise<SalesQuotaEntity> {
    const quota = await this.quotaRepo.findOne({ where: { id: quotaId } });
    if (!quota) throw new NotFoundException(`Quota ${quotaId} not found`);

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

  async getQuotaOverview(workspaceId: string, period?: string): Promise<{
    quotas: number;
    totalTargetAmount: number;
    totalAchievedAmount: number;
    atRiskCount: number;
    achievementRate: number;
  }> {
    const where: Record<string, unknown> = { workspaceId };
    if (period) where.period = period;

    const quotas = await this.quotaRepo.find({ where });
    const totalTargetAmount = quotas.reduce((sum, quota) => sum + (quota.targetAmount ?? 0), 0);
    const totalAchievedAmount = quotas.reduce((sum, quota) => sum + (quota.achievedAmount ?? 0), 0);
    const atRiskCount = quotas.filter((quota) => quota.status === QuotaStatus.AT_RISK || quota.status === QuotaStatus.BEHIND).length;

    return {
      quotas: quotas.length,
      totalTargetAmount,
      totalAchievedAmount,
      atRiskCount,
      achievementRate: totalTargetAmount ? Math.round((totalAchievedAmount / totalTargetAmount) * 100) : 0,
    };
  }
}
