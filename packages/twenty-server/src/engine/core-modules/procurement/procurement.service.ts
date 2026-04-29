import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseRequestEntity, RFQEntity, VendorScorecardEntity, PRStatus } from './procurement.entity';

@Injectable()
export class ProcurementService {
  constructor(
    @InjectRepository(PurchaseRequestEntity) private readonly prRepo: Repository<PurchaseRequestEntity>,
    @InjectRepository(RFQEntity) private readonly rfqRepo: Repository<RFQEntity>,
    @InjectRepository(VendorScorecardEntity) private readonly scorecardRepo: Repository<VendorScorecardEntity>,
  ) {}

  async createPR(workspaceId: string, data: Partial<PurchaseRequestEntity>): Promise<PurchaseRequestEntity> {
    const total = data.items?.reduce((s, i) => s + i.quantity * i.unitPrice, 0) ?? 0;
    return this.prRepo.save(this.prRepo.create({ workspaceId, estimatedAmount: total, ...data }));
  }

  async approvePR(prId: string, approverId: string): Promise<PurchaseRequestEntity> {
    const pr = await this.prRepo.findOne({ where: { id: prId } });
    if (!pr) throw new NotFoundException(`PR ${prId} not found`);
    pr.status = PRStatus.APPROVED; pr.approverId = approverId;
    return this.prRepo.save(pr);
  }

  async createRFQ(workspaceId: string, purchaseRequestId: string, supplierIds: string[], deadline: Date): Promise<RFQEntity> {
    return this.rfqRepo.save(this.rfqRepo.create({ workspaceId, purchaseRequestId, supplierIds, deadline }));
  }

  async submitRFQResponse(rfqId: string, supplierId: string, totalPrice: number, leadTimeDays: number, terms: string): Promise<RFQEntity> {
    const rfq = await this.rfqRepo.findOne({ where: { id: rfqId } });
    if (!rfq) throw new NotFoundException(`RFQ ${rfqId} not found`);
    const responses = rfq.responses ?? [];
    responses.push({ supplierId, totalPrice, leadTimeDays, terms, receivedAt: new Date().toISOString() });
    rfq.responses = responses;
    return this.rfqRepo.save(rfq);
  }

  async compareRFQResponses(rfqId: string): Promise<Array<{ supplierId: string; totalPrice: number; leadTimeDays: number; score: number }>> {
    const rfq = await this.rfqRepo.findOne({ where: { id: rfqId } });
    if (!rfq?.responses?.length) return [];
    const minPrice = Math.min(...rfq.responses.map((r) => r.totalPrice));
    const minLead = Math.min(...rfq.responses.map((r) => r.leadTimeDays));
    return rfq.responses.map((r) => ({
      supplierId: r.supplierId, totalPrice: r.totalPrice, leadTimeDays: r.leadTimeDays,
      score: Math.round((minPrice / r.totalPrice) * 60 + (minLead / r.leadTimeDays) * 40),
    })).sort((a, b) => b.score - a.score);
  }

  async selectSupplier(rfqId: string, supplierId: string): Promise<RFQEntity> {
    const rfq = await this.rfqRepo.findOne({ where: { id: rfqId } });
    if (!rfq) throw new NotFoundException(`RFQ ${rfqId} not found`);
    rfq.selectedSupplierId = supplierId; rfq.status = 'awarded';
    return this.rfqRepo.save(rfq);
  }

  async updateVendorScorecard(workspaceId: string, supplierId: string, period: string, metrics: Partial<VendorScorecardEntity>): Promise<VendorScorecardEntity> {
    let card = await this.scorecardRepo.findOne({ where: { workspaceId, supplierId, period } });
    if (!card) card = this.scorecardRepo.create({ workspaceId, supplierId, period });
    Object.assign(card, metrics);
    card.overallScore = ((card.onTimeDeliveryRate ?? 0) + (card.qualityScore ?? 0) + (card.priceComplianceRate ?? 0) + (card.responseTimeScore ?? 0)) / 4;
    return this.scorecardRepo.save(card);
  }

  async getSpendByCategory(workspaceId: string): Promise<Record<string, number>> {
    const prs = await this.prRepo.find({ where: { workspaceId, status: PRStatus.ORDERED } });
    const spend: Record<string, number> = {};
    for (const pr of prs) { spend[pr.category ?? 'other'] = (spend[pr.category ?? 'other'] ?? 0) + Number(pr.estimatedAmount); }
    return spend;
  }
}
