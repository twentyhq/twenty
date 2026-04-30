import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { randomUUID } from 'crypto';
import {
  PortalAccessEntity, AutopayEntity, EarlyPaymentDiscountEntity, CollectionScoreEntity,
  PortalAccessStatus, AutopayStatus,
} from './customer-portal.entity';
import { InvoiceEntity, InvoiceStatus, DisputeEntity, DisputeStatus, PaymentPromiseEntity } from './accounts-receivable.entity';

@Injectable()
export class CustomerPortalService {
  constructor(
    @InjectRepository(PortalAccessEntity) private readonly portalRepo: Repository<PortalAccessEntity>,
    @InjectRepository(AutopayEntity) private readonly autopayRepo: Repository<AutopayEntity>,
    @InjectRepository(EarlyPaymentDiscountEntity) private readonly discountRepo: Repository<EarlyPaymentDiscountEntity>,
    @InjectRepository(CollectionScoreEntity) private readonly scoreRepo: Repository<CollectionScoreEntity>,
    @InjectRepository(InvoiceEntity) private readonly invoiceRepo: Repository<InvoiceEntity>,
    @InjectRepository(DisputeEntity) private readonly disputeRepo: Repository<DisputeEntity>,
    @InjectRepository(PaymentPromiseEntity) private readonly promiseRepo: Repository<PaymentPromiseEntity>,
  ) {}

  // ==================== PORTAL ACCESS ====================

  async generatePortalAccess(workspaceId: string, accountId: string, contactEmail: string): Promise<PortalAccessEntity> {
    const existing = await this.portalRepo.findOne({ where: { workspaceId, accountId, contactEmail } });
    if (existing?.status === PortalAccessStatus.ACTIVE) return existing;

    return this.portalRepo.save(this.portalRepo.create({
      workspaceId, accountId, contactEmail,
      accessToken: randomUUID(),
      expiresAt: new Date(Date.now() + 365 * 86_400_000),
    }));
  }

  async validatePortalToken(token: string): Promise<PortalAccessEntity | null> {
    const access = await this.portalRepo.findOne({ where: { accessToken: token, status: PortalAccessStatus.ACTIVE } });
    if (!access) return null;
    if (access.expiresAt && access.expiresAt < new Date()) {
      access.status = PortalAccessStatus.EXPIRED;
      await this.portalRepo.save(access);
      return null;
    }
    access.lastAccessAt = new Date();
    await this.portalRepo.save(access);
    return access;
  }

  // ==================== CUSTOMER INVOICE VIEW ====================

  async getCustomerInvoices(workspaceId: string, accountId: string, filter?: string): Promise<InvoiceEntity[]> {
    const statuses = filter === 'pending'
      ? [InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.OVERDUE]
      : filter === 'paid'
        ? [InvoiceStatus.PAID]
        : filter === 'disputed'
          ? [InvoiceStatus.DISPUTED]
          : undefined;

    return this.invoiceRepo.find({
      where: { workspaceId, accountId, ...(statuses ? { status: In(statuses) } : {}) },
      order: { dueDate: 'DESC' },
    });
  }

  async getCustomerInvoiceSummary(workspaceId: string, accountId: string): Promise<{
    totalPending: number; totalOverdue: number; totalPaid: number;
    pendingCount: number; overdueCount: number; paidCount: number;
  }> {
    const invoices = await this.invoiceRepo.find({ where: { workspaceId, accountId } });
    const pending = invoices.filter((i) => [InvoiceStatus.SENT, InvoiceStatus.VIEWED].includes(i.status));
    const overdue = invoices.filter((i) => i.status === InvoiceStatus.OVERDUE);
    const paid = invoices.filter((i) => i.status === InvoiceStatus.PAID);

    return {
      totalPending: pending.reduce((s, i) => s + Number(i.balanceDue), 0),
      totalOverdue: overdue.reduce((s, i) => s + Number(i.balanceDue), 0),
      totalPaid: paid.reduce((s, i) => s + Number(i.totalAmount), 0),
      pendingCount: pending.length, overdueCount: overdue.length, paidCount: paid.length,
    };
  }

  // ==================== ONLINE PAYMENT ====================

  async generatePaymentLink(invoiceId: string, gateway: string): Promise<string> {
    const invoice = await this.invoiceRepo.findOne({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException(`Invoice ${invoiceId} not found`);
    // Gateway-specific checkout URL
    return `https://pay.example.com/${gateway}/checkout?invoice=${invoiceId}&amount=${invoice.balanceDue}&currency=${invoice.currency}`;
  }

  // ==================== AUTOPAY ====================

  async enrollAutopay(workspaceId: string, accountId: string, data: Partial<AutopayEntity>): Promise<AutopayEntity> {
    return this.autopayRepo.save(this.autopayRepo.create({ workspaceId, accountId, ...data }));
  }

  async processAutopay(workspaceId: string): Promise<{ charged: number; failed: number }> {
    const enrollments = await this.autopayRepo.find({ where: { workspaceId, status: AutopayStatus.ACTIVE } });
    let charged = 0;
    let failed = 0;

    for (const enrollment of enrollments) {
      const dueInvoices = await this.invoiceRepo.find({
        where: { workspaceId, accountId: enrollment.accountId, status: In([InvoiceStatus.SENT, InvoiceStatus.OVERDUE]) },
      });

      for (const inv of dueInvoices) {
        if (enrollment.maxAmount && Number(inv.balanceDue) > Number(enrollment.maxAmount)) continue;
        // Simulate charge — in production, call Stripe/PayU API
        enrollment.successfulCharges++;
        enrollment.lastChargedAt = new Date();
        charged++;
      }
      await this.autopayRepo.save(enrollment);
    }

    return { charged, failed };
  }

  async cancelAutopay(autopayId: string): Promise<AutopayEntity> {
    const ap = await this.autopayRepo.findOne({ where: { id: autopayId } });
    if (!ap) throw new NotFoundException(`Autopay ${autopayId} not found`);
    ap.status = AutopayStatus.CANCELLED;
    return this.autopayRepo.save(ap);
  }

  // ==================== PAYMENT PROMISE (SELF-SERVICE) ====================

  async createPromiseFromPortal(workspaceId: string, invoiceId: string, accountId: string, promisedDate: Date, promisedAmount: number): Promise<PaymentPromiseEntity> {
    return this.promiseRepo.save(this.promiseRepo.create({ workspaceId, invoiceId, accountId, promisedDate, promisedAmount }));
  }

  // ==================== DISPUTE (SELF-SERVICE) ====================

  async openDisputeFromPortal(workspaceId: string, invoiceId: string, data: {
    reason: string; description?: string; disputedAmount?: number; evidenceIds?: string[];
  }): Promise<DisputeEntity> {
    await this.invoiceRepo.update(invoiceId, { status: InvoiceStatus.DISPUTED });
    return this.disputeRepo.save(this.disputeRepo.create({
      workspaceId, invoiceId, reason: data.reason as any,
      description: data.description, disputedAmount: data.disputedAmount,
      evidenceIds: data.evidenceIds,
    }));
  }

  // ==================== EARLY PAYMENT DISCOUNTS ====================

  async createEarlyPaymentDiscount(workspaceId: string, data: Partial<EarlyPaymentDiscountEntity>): Promise<EarlyPaymentDiscountEntity> {
    return this.discountRepo.save(this.discountRepo.create({ workspaceId, ...data }));
  }

  async getEligibleDiscounts(workspaceId: string, invoiceId: string): Promise<Array<{ name: string; discountPercent: number; discountAmount: number; payByDate: Date }>> {
    const invoice = await this.invoiceRepo.findOne({ where: { id: invoiceId } });
    if (!invoice) return [];
    const discounts = await this.discountRepo.find({ where: { workspaceId, isActive: true } });
    const eligible: Array<{ name: string; discountPercent: number; discountAmount: number; payByDate: Date }> = [];

    for (const d of discounts) {
      const payByDate = new Date(new Date(invoice.dueDate).getTime() - d.daysBeforeDue * 86_400_000);
      if (payByDate > new Date()) {
        eligible.push({
          name: d.name, discountPercent: Number(d.discountPercent),
          discountAmount: Number(invoice.balanceDue) * Number(d.discountPercent) / 100,
          payByDate,
        });
      }
    }

    return eligible;
  }

  // ==================== AI COLLECTION SCORING ====================

  async calculateCollectionScore(workspaceId: string, accountId: string): Promise<CollectionScoreEntity> {
    let score = await this.scoreRepo.findOne({ where: { workspaceId, accountId } });
    if (!score) score = this.scoreRepo.create({ workspaceId, accountId });

    const invoices = await this.invoiceRepo.find({ where: { workspaceId, accountId } });
    const paid = invoices.filter((i) => i.status === InvoiceStatus.PAID);
    const overdue = invoices.filter((i) => i.status === InvoiceStatus.OVERDUE);
    const promises = await this.promiseRepo.find({ where: { workspaceId, accountId } });

    score.totalOutstanding = overdue.reduce((s, i) => s + Number(i.balanceDue), 0);
    score.avgDaysLate = paid.length
      ? Math.round(paid.filter((i) => i.paidAt && i.dueDate && i.paidAt > i.dueDate)
          .reduce((s, i) => s + (i.paidAt!.getTime() - new Date(i.dueDate).getTime()) / 86_400_000, 0) / Math.max(1, paid.length))
      : 0;
    score.promisesKept = promises.filter((p) => p.kept).length;
    score.promisesBroken = promises.filter((p) => p.broken).length;

    // Score 0-100: lower = higher risk
    let risk = 50;
    risk -= overdue.length * 10;
    risk -= score.avgDaysLate * 0.5;
    risk -= score.promisesBroken * 15;
    risk += score.promisesKept * 5;
    risk += paid.length * 2;
    score.riskScore = Math.max(0, Math.min(100, risk));
    score.paymentProbability = score.riskScore;

    // Segment and call priority
    score.segment = score.riskScore < 30 ? 'high_risk' : score.riskScore < 60 ? 'standard' : 'low_risk';
    score.callPriority = score.segment === 'high_risk' ? 1 : score.segment === 'standard' ? 2 : 3;

    return this.scoreRepo.save(score);
  }

  async getDailyCallList(workspaceId: string): Promise<Array<{
    accountId: string; priority: number; totalOutstanding: number; riskScore: number; segment: string;
  }>> {
    const scores = await this.scoreRepo.find({
      where: { workspaceId },
      order: { callPriority: 'ASC', totalOutstanding: 'DESC' },
    });
    return scores
      .filter((s) => Number(s.totalOutstanding) > 0)
      .map((s) => ({
        accountId: s.accountId, priority: s.callPriority,
        totalOutstanding: Number(s.totalOutstanding),
        riskScore: s.riskScore, segment: s.segment,
      }));
  }
}
