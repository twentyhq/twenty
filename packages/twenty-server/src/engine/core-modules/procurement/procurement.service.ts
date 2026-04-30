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

  // --- THREE WAY MATCH ---
  async threeWayMatch(
    workspaceId: string,
    prId: string,
    invoiceAmount: number,
    receivedQuantity: number,
  ): Promise<{ matched: boolean; discrepancies: string[] }> {
    const pr = await this.prRepo.findOne({ where: { id: prId, workspaceId } });
    if (!pr) throw new NotFoundException(`PR ${prId} not found`);

    const discrepancies: string[] = [];
    const prAmount = Number(pr.estimatedAmount);
    const prQuantity = pr.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

    // Check PR amount vs invoice amount
    if (Math.abs(prAmount - invoiceAmount) > 0.01) {
      discrepancies.push(
        `Invoice amount mismatch: PR=${prAmount.toFixed(2)}, Invoice=${invoiceAmount.toFixed(2)}`,
      );
    }

    // Check PR quantity vs received quantity
    if (prQuantity !== receivedQuantity) {
      discrepancies.push(
        `Quantity mismatch: PR ordered=${prQuantity}, Received=${receivedQuantity}`,
      );
    }

    return {
      matched: discrepancies.length === 0,
      discrepancies,
    };
  }

  // --- TOP SUPPLIERS ---
  async getTopSuppliers(
    workspaceId: string,
    period?: string,
  ): Promise<Array<{ supplierId: string; totalSpend: number; orderCount: number; scorecard: { overallScore: number } | null }>> {
    const rfqs = await this.rfqRepo.find({ where: { workspaceId, status: 'awarded' } });

    const supplierSpend = new Map<string, { totalSpend: number; orderCount: number }>();

    for (const rfq of rfqs) {
      if (!rfq.selectedSupplierId) continue;
      const response = rfq.responses?.find((r) => r.supplierId === rfq.selectedSupplierId);
      if (!response) continue;

      const existing = supplierSpend.get(rfq.selectedSupplierId) ?? { totalSpend: 0, orderCount: 0 };
      existing.totalSpend += response.totalPrice;
      existing.orderCount++;
      supplierSpend.set(rfq.selectedSupplierId, existing);
    }

    const results: Array<{ supplierId: string; totalSpend: number; orderCount: number; scorecard: { overallScore: number } | null }> = [];

    for (const [supplierId, data] of supplierSpend.entries()) {
      const whereClause: Record<string, unknown> = { workspaceId, supplierId };
      if (period) whereClause['period'] = period;
      const scorecard = await this.scorecardRepo.findOne({
        where: whereClause as { workspaceId: string; supplierId: string; period?: string },
        order: { createdAt: 'DESC' },
      });

      results.push({
        supplierId,
        totalSpend: Math.round(data.totalSpend * 100) / 100,
        orderCount: data.orderCount,
        scorecard: scorecard ? { overallScore: scorecard.overallScore } : null,
      });
    }

    return results.sort((a, b) => b.totalSpend - a.totalSpend);
  }

  // --- DUPLICATE SPEND DETECTION ---
  async detectDuplicateSpend(
    workspaceId: string,
  ): Promise<Array<{ itemDescription: string; matchingPRs: Array<{ prId: string; requesterId: string; amount: number; category: string }> }>> {
    const prs = await this.prRepo.find({ where: { workspaceId } });

    // Build a map of item descriptions to PRs
    const itemMap = new Map<string, Array<{ prId: string; requesterId: string; amount: number; category: string }>>();

    for (const pr of prs) {
      if (!pr.items) continue;
      for (const item of pr.items) {
        const normalized = item.description.toLowerCase().trim();
        const existing = itemMap.get(normalized) ?? [];
        existing.push({
          prId: pr.id,
          requesterId: pr.requesterId,
          amount: item.quantity * item.unitPrice,
          category: pr.category ?? 'other',
        });
        itemMap.set(normalized, existing);
      }
    }

    // Only return items that appear in multiple PRs from different requesters
    const duplicates: Array<{ itemDescription: string; matchingPRs: Array<{ prId: string; requesterId: string; amount: number; category: string }> }> = [];

    for (const [description, entries] of itemMap.entries()) {
      const uniqueRequesters = new Set(entries.map((e) => e.requesterId));
      if (entries.length > 1 && uniqueRequesters.size > 1) {
        duplicates.push({ itemDescription: description, matchingPRs: entries });
      }
    }

    return duplicates;
  }
}
