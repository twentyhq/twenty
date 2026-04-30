import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EmbeddedPaymentEntity, ElectronicInvoiceEntity, PartnerChannelEntity,
  RevenueReconciliationEntity, PaymentGateway, EInvoiceProvider,
} from './fintech.entity';

@Injectable()
export class FintechService {
  constructor(
    @InjectRepository(EmbeddedPaymentEntity) private readonly paymentRepo: Repository<EmbeddedPaymentEntity>,
    @InjectRepository(ElectronicInvoiceEntity) private readonly eInvoiceRepo: Repository<ElectronicInvoiceEntity>,
    @InjectRepository(PartnerChannelEntity) private readonly partnerRepo: Repository<PartnerChannelEntity>,
    @InjectRepository(RevenueReconciliationEntity) private readonly reconRepo: Repository<RevenueReconciliationEntity>,
  ) {}

  // --- EMBEDDED PAYMENTS ---
  async createPaymentLink(
    workspaceId: string,
    quoteId: string,
    dealId: string,
    amount: number,
    gateway: PaymentGateway,
    currency = 'COP',
  ): Promise<EmbeddedPaymentEntity> {
    const paymentLink = `https://pay.example.com/${gateway}/${quoteId}`;
    return this.paymentRepo.save(this.paymentRepo.create({
      workspaceId, quoteId, dealId, amount, gateway, currency, paymentLink,
    }));
  }

  async markPaymentCompleted(paymentId: string, externalPaymentId: string): Promise<EmbeddedPaymentEntity> {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException(`Payment ${paymentId} not found`);
    payment.status = 'completed';
    payment.externalPaymentId = externalPaymentId;
    payment.paidAt = new Date();
    return this.paymentRepo.save(payment);
  }

  // --- ELECTRONIC INVOICING ---
  async submitElectronicInvoice(
    workspaceId: string,
    invoiceId: string,
    provider: EInvoiceProvider,
    xmlContent: string,
  ): Promise<ElectronicInvoiceEntity> {
    return this.eInvoiceRepo.save(this.eInvoiceRepo.create({
      workspaceId, invoiceId, provider, xmlContent,
      status: 'submitted', submittedAt: new Date(),
    }));
  }

  async markInvoiceAccepted(eInvoiceId: string, cufe: string, pdfUrl: string): Promise<ElectronicInvoiceEntity> {
    const inv = await this.eInvoiceRepo.findOne({ where: { id: eInvoiceId } });
    if (!inv) throw new NotFoundException(`E-Invoice ${eInvoiceId} not found`);
    inv.status = 'accepted';
    inv.cufe = cufe;
    inv.pdfUrl = pdfUrl;
    inv.acceptedAt = new Date();
    return this.eInvoiceRepo.save(inv);
  }

  async markInvoiceRejected(eInvoiceId: string, reason: string): Promise<ElectronicInvoiceEntity> {
    const inv = await this.eInvoiceRepo.findOne({ where: { id: eInvoiceId } });
    if (!inv) throw new NotFoundException(`E-Invoice ${eInvoiceId} not found`);
    inv.status = 'rejected';
    inv.rejectionReason = reason;
    return this.eInvoiceRepo.save(inv);
  }

  // --- PARTNER/CHANNEL ---
  async createPartner(workspaceId: string, data: Partial<PartnerChannelEntity>): Promise<PartnerChannelEntity> {
    return this.partnerRepo.save(this.partnerRepo.create({ workspaceId, ...data }));
  }

  async recordPartnerDeal(partnerId: string, dealAmount: number): Promise<PartnerChannelEntity> {
    const partner = await this.partnerRepo.findOne({ where: { id: partnerId } });
    if (!partner) throw new NotFoundException(`Partner ${partnerId} not found`);
    partner.activeDeals++;
    partner.totalRevenue = Number(partner.totalRevenue) + dealAmount;
    const commission = dealAmount * (Number(partner.commissionRate) / 100);
    partner.totalCommissionPaid = Number(partner.totalCommissionPaid) + commission;
    return this.partnerRepo.save(partner);
  }

  async getPartnerPerformance(workspaceId: string): Promise<PartnerChannelEntity[]> {
    return this.partnerRepo.find({ where: { workspaceId }, order: { totalRevenue: 'DESC' } });
  }

  // --- REVENUE RECONCILIATION ---
  async reconcilePayment(
    workspaceId: string,
    paymentId: string,
    dealId: string,
    invoiceId: string,
    amount: number,
    source: string,
  ): Promise<RevenueReconciliationEntity> {
    return this.reconRepo.save(this.reconRepo.create({
      workspaceId, paymentId, dealId, invoiceId, amount, source, status: 'matched',
    }));
  }

  async getUnreconciledPayments(workspaceId: string): Promise<EmbeddedPaymentEntity[]> {
    const reconciled = await this.reconRepo.find({ where: { workspaceId } });
    const reconciledPaymentIds = new Set(reconciled.map((r) => r.paymentId));
    const all = await this.paymentRepo.find({ where: { workspaceId, status: 'completed' } });
    return all.filter((p) => !reconciledPaymentIds.has(p.id));
  }
}
