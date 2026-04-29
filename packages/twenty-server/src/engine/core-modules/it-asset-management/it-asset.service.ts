import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import {
  ITAssetEntity, SoftwareLicenseEntity, ITTicketEntity, ChangeRequestEntity,
  AssetStatus, DepreciationMethod,
} from './it-asset.entity';

@Injectable()
export class ITAssetService {
  constructor(
    @InjectRepository(ITAssetEntity) private readonly assetRepo: Repository<ITAssetEntity>,
    @InjectRepository(SoftwareLicenseEntity) private readonly licenseRepo: Repository<SoftwareLicenseEntity>,
    @InjectRepository(ITTicketEntity) private readonly ticketRepo: Repository<ITTicketEntity>,
    @InjectRepository(ChangeRequestEntity) private readonly changeRepo: Repository<ChangeRequestEntity>,
  ) {}

  // --- ASSETS ---
  async registerAsset(workspaceId: string, data: Partial<ITAssetEntity>): Promise<ITAssetEntity> {
    return this.assetRepo.save(this.assetRepo.create({ workspaceId, ...data }));
  }

  async assignAsset(assetId: string, userId: string): Promise<ITAssetEntity> {
    const asset = await this.findAssetOrFail(assetId);
    if (asset.status === AssetStatus.ASSIGNED) {
      throw new BadRequestException(`Asset already assigned to ${asset.assignedToId}`);
    }
    const history = asset.assignmentHistory ?? [];
    history.push({ userId, from: new Date().toISOString(), to: '' });
    asset.assignedToId = userId;
    asset.status = AssetStatus.ASSIGNED;
    asset.assignmentHistory = history;
    return this.assetRepo.save(asset);
  }

  async unassignAsset(assetId: string): Promise<ITAssetEntity> {
    const asset = await this.findAssetOrFail(assetId);
    const history = asset.assignmentHistory ?? [];
    if (history.length) history[history.length - 1].to = new Date().toISOString();
    asset.assignedToId = undefined;
    asset.status = AssetStatus.AVAILABLE;
    asset.assignmentHistory = history;
    return this.assetRepo.save(asset);
  }

  async calculateDepreciation(assetId: string): Promise<number> {
    const asset = await this.findAssetOrFail(assetId);
    if (asset.depreciationMethod === DepreciationMethod.NONE || !asset.purchaseDate) return Number(asset.purchasePrice);

    const monthsOwned = Math.floor((Date.now() - new Date(asset.purchaseDate).getTime()) / (30 * 86_400_000));
    const monthlyDep = Number(asset.purchasePrice) / asset.usefulLifeMonths;
    const currentValue = Math.max(0, Number(asset.purchasePrice) - monthlyDep * monthsOwned);

    asset.currentValue = Math.round(currentValue * 100) / 100;
    await this.assetRepo.save(asset);
    return asset.currentValue;
  }

  async getExpiringWarranties(workspaceId: string, withinDays: number): Promise<ITAssetEntity[]> {
    const cutoff = new Date(Date.now() + withinDays * 86_400_000);
    return this.assetRepo.find({
      where: { workspaceId, warrantyExpiry: LessThan(cutoff) },
      order: { warrantyExpiry: 'ASC' },
    });
  }

  async getMaintenanceDue(workspaceId: string): Promise<ITAssetEntity[]> {
    return this.assetRepo.find({
      where: { workspaceId, nextMaintenanceDate: LessThan(new Date()) },
    });
  }

  async disposeAsset(assetId: string): Promise<ITAssetEntity> {
    const asset = await this.findAssetOrFail(assetId);
    asset.status = AssetStatus.DISPOSED;
    asset.currentValue = 0;
    return this.assetRepo.save(asset);
  }

  // --- LICENSES ---
  async registerLicense(workspaceId: string, data: Partial<SoftwareLicenseEntity>): Promise<SoftwareLicenseEntity> {
    return this.licenseRepo.save(this.licenseRepo.create({ workspaceId, ...data }));
  }

  async getLicenseUtilization(workspaceId: string): Promise<Array<{ name: string; total: number; used: number; waste: number; annualCost: number }>> {
    const licenses = await this.licenseRepo.find({ where: { workspaceId, status: 'active' } });
    return licenses.map((l) => ({
      name: l.name,
      total: l.totalSeats,
      used: l.usedSeats,
      waste: l.totalSeats - l.usedSeats,
      annualCost: Number(l.annualCost),
    }));
  }

  async getExpiringLicenses(workspaceId: string, withinDays: number): Promise<SoftwareLicenseEntity[]> {
    const cutoff = new Date(Date.now() + withinDays * 86_400_000);
    return this.licenseRepo.find({
      where: { workspaceId, renewalDate: LessThan(cutoff), status: 'active' },
    });
  }

  async getSaaSSpend(workspaceId: string): Promise<{ total: number; byVendor: Record<string, number> }> {
    const licenses = await this.licenseRepo.find({ where: { workspaceId, status: 'active' } });
    const byVendor: Record<string, number> = {};
    let total = 0;
    for (const l of licenses) {
      const cost = Number(l.annualCost);
      total += cost;
      byVendor[l.vendor ?? 'Unknown'] = (byVendor[l.vendor ?? 'Unknown'] ?? 0) + cost;
    }
    return { total, byVendor };
  }

  // --- IT TICKETS ---
  async createITTicket(workspaceId: string, data: Partial<ITTicketEntity>): Promise<ITTicketEntity> {
    return this.ticketRepo.save(this.ticketRepo.create({ workspaceId, ...data }));
  }

  // --- CHANGE MANAGEMENT ---
  async createChangeRequest(workspaceId: string, data: Partial<ChangeRequestEntity>): Promise<ChangeRequestEntity> {
    return this.changeRepo.save(this.changeRepo.create({ workspaceId, ...data }));
  }

  async approveChange(changeId: string, approverId: string): Promise<ChangeRequestEntity> {
    const change = await this.changeRepo.findOne({ where: { id: changeId } });
    if (!change) throw new NotFoundException(`Change request ${changeId} not found`);
    change.status = 'approved';
    change.approverId = approverId;
    return this.changeRepo.save(change);
  }

  private async findAssetOrFail(assetId: string): Promise<ITAssetEntity> {
    const asset = await this.assetRepo.findOne({ where: { id: assetId } });
    if (!asset) throw new NotFoundException(`Asset ${assetId} not found`);
    return asset;
  }
}
