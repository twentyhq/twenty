import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan, In } from 'typeorm';
import {
  InvoiceEntity, PaymentEntity, DisputeEntity, DunningSequenceEntity, PaymentPromiseEntity,
  InvoiceStatus, DisputeStatus, PaymentMethod,
} from './accounts-receivable.entity';

@Injectable()
export class AccountsReceivableService {
  constructor(
    @InjectRepository(InvoiceEntity) private readonly invoiceRepo: Repository<InvoiceEntity>,
    @InjectRepository(PaymentEntity) private readonly paymentRepo: Repository<PaymentEntity>,
    @InjectRepository(DisputeEntity) private readonly disputeRepo: Repository<DisputeEntity>,
    @InjectRepository(DunningSequenceEntity) private readonly dunningRepo: Repository<DunningSequenceEntity>,
    @InjectRepository(PaymentPromiseEntity) private readonly promiseRepo: Repository<PaymentPromiseEntity>,
  ) {}

  // --- INVOICING ---
  async createInvoiceFromDeal(
    workspaceId: string,
    data: {
      accountId: string;
      dealId: string;
      quoteId?: string;
      lineItems: Array<{ description: string; quantity: number; unitPrice: number; tax: number }>;
      currency?: string;
      paymentTermsDays?: number;
    },
  ): Promise<InvoiceEntity> {
    const items = data.lineItems.map((li) => ({
      ...li,
      total: li.quantity * li.unitPrice * (1 + li.tax),
    }));
    const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const taxAmount = items.reduce((s, i) => s + i.quantity * i.unitPrice * i.tax, 0);
    const totalAmount = subtotal + taxAmount;
    const now = new Date();
    const termsDays = data.paymentTermsDays ?? 30;
    const dueDate = new Date(now.getTime() + termsDays * 86_400_000);

    const count = await this.invoiceRepo.count({ where: { workspaceId } });
    const invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`;

    return this.invoiceRepo.save(this.invoiceRepo.create({
      workspaceId, accountId: data.accountId, dealId: data.dealId, quoteId: data.quoteId,
      invoiceNumber, subtotal, taxAmount, totalAmount, balanceDue: totalAmount,
      currency: data.currency ?? 'COP', issueDate: now, dueDate, paymentTermsDays: termsDays,
      lineItems: items,
    }));
  }

  async sendInvoice(invoiceId: string): Promise<InvoiceEntity> {
    const inv = await this.findInvoiceOrFail(invoiceId);
    inv.status = InvoiceStatus.SENT;
    inv.sentAt = new Date();
    return this.invoiceRepo.save(inv);
  }

  async markViewed(invoiceId: string): Promise<void> {
    await this.invoiceRepo.update(invoiceId, { status: InvoiceStatus.VIEWED, viewedAt: new Date() });
  }

  // --- PAYMENTS & CASH APPLICATION ---
  async applyPayment(
    workspaceId: string,
    invoiceId: string,
    amount: number,
    method: PaymentMethod,
    externalReference?: string,
  ): Promise<PaymentEntity> {
    const inv = await this.findInvoiceOrFail(invoiceId);
    const existingDuplicate = await this.paymentRepo.findOne({
      where: { workspaceId, invoiceId, amount, externalReference },
    });
    if (existingDuplicate) {
      throw new BadRequestException('Duplicate payment detected');
    }

    const payment = await this.paymentRepo.save(this.paymentRepo.create({
      workspaceId, invoiceId, amount, method, externalReference, receivedAt: new Date(), matchStatus: 'applied', matchConfidence: 1,
    }));

    inv.amountPaid = Number(inv.amountPaid) + amount;
    inv.balanceDue = Number(inv.totalAmount) - inv.amountPaid;

    if (inv.balanceDue <= 0) {
      inv.status = InvoiceStatus.PAID;
      inv.paidAt = new Date();
      inv.balanceDue = 0;
    } else {
      inv.status = InvoiceStatus.PARTIALLY_PAID;
    }

    await this.invoiceRepo.save(inv);
    return payment;
  }

  async autoMatchPayments(
    workspaceId: string,
    bankEntries: Array<{ amount: number; reference: string; date: Date }>,
  ): Promise<{ matched: number; unmatched: number }> {
    let matched = 0;
    let unmatched = 0;

    for (const entry of bankEntries) {
      const invoice = await this.invoiceRepo.findOne({
        where: { workspaceId, balanceDue: entry.amount, status: In([InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.OVERDUE]) },
      });

      if (invoice) {
        await this.applyPayment(workspaceId, invoice.id, entry.amount, PaymentMethod.BANK_TRANSFER, entry.reference);
        matched++;
      } else {
        unmatched++;
      }
    }

    return { matched, unmatched };
  }

  // --- LATE FEES ---
  async applyLateFees(workspaceId: string): Promise<number> {
    const overdue = await this.invoiceRepo.find({
      where: { workspaceId, status: InvoiceStatus.OVERDUE },
    });
    let applied = 0;

    for (const inv of overdue) {
      if (inv.lateFeeRate > 0) {
        const daysOverdue = Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / 86_400_000);
        const fee = Number(inv.balanceDue) * (Number(inv.lateFeeRate) / 100) * (daysOverdue / 30);
        inv.lateFeeAmount = Math.round(fee * 100) / 100;
        inv.totalAmount = Number(inv.subtotal) + Number(inv.taxAmount) + inv.lateFeeAmount;
        inv.balanceDue = inv.totalAmount - Number(inv.amountPaid);
        await this.invoiceRepo.save(inv);
        applied++;
      }
    }

    return applied;
  }

  async markOverdueInvoices(workspaceId: string): Promise<number> {
    const result = await this.invoiceRepo
      .createQueryBuilder()
      .update()
      .set({ status: InvoiceStatus.OVERDUE })
      .where('workspaceId = :workspaceId', { workspaceId })
      .andWhere('dueDate < :now', { now: new Date() })
      .andWhere('status IN (:...statuses)', { statuses: [InvoiceStatus.SENT, InvoiceStatus.VIEWED] })
      .execute();

    return result.affected ?? 0;
  }

  // --- DISPUTES ---
  async openDispute(
    workspaceId: string,
    invoiceId: string,
    data: { reason: string; description?: string; disputedAmount?: number },
  ): Promise<DisputeEntity> {
    await this.invoiceRepo.update(invoiceId, { status: InvoiceStatus.DISPUTED });
    return this.disputeRepo.save(this.disputeRepo.create({
      workspaceId, invoiceId, reason: data.reason as any, description: data.description,
      disputedAmount: data.disputedAmount,
    }));
  }

  async resolveDispute(disputeId: string, resolution: string): Promise<DisputeEntity> {
    const dispute = await this.disputeRepo.findOne({ where: { id: disputeId } });
    if (!dispute) throw new NotFoundException(`Dispute ${disputeId} not found`);
    dispute.status = DisputeStatus.RESOLVED;
    dispute.resolvedAt = new Date();
    dispute.resolution = resolution;
    return this.disputeRepo.save(dispute);
  }

  // --- DUNNING ---
  async createDunningSequence(
    workspaceId: string,
    data: Partial<DunningSequenceEntity>,
  ): Promise<DunningSequenceEntity> {
    return this.dunningRepo.save(this.dunningRepo.create({ workspaceId, ...data }));
  }

  async getDunningActions(workspaceId: string): Promise<Array<{ invoiceId: string; step: number; channel: string; tone: string }>> {
    const sequences = await this.dunningRepo.find({ where: { workspaceId, isActive: true } });
    const overdue = await this.invoiceRepo.find({ where: { workspaceId, status: InvoiceStatus.OVERDUE } });
    const actions: Array<{ invoiceId: string; step: number; channel: string; tone: string }> = [];

    for (const inv of overdue) {
      const hasDispute = await this.disputeRepo.findOne({ where: { invoiceId: inv.id, status: DisputeStatus.OPEN } });
      const hasPromise = await this.promiseRepo.findOne({ where: { invoiceId: inv.id, kept: false, broken: false } });
      if (hasDispute || hasPromise) continue;

      const daysOverdue = Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / 86_400_000);
      for (const seq of sequences) {
        for (let i = 0; i < seq.steps.length; i++) {
          if (daysOverdue >= seq.steps[i].dayOffset) {
            actions.push({ invoiceId: inv.id, step: i, channel: seq.steps[i].channel, tone: seq.steps[i].tone });
          }
        }
      }
    }

    return actions;
  }

  // --- PROMISES ---
  async recordPromise(workspaceId: string, invoiceId: string, accountId: string, promisedDate: Date, promisedAmount: number): Promise<PaymentPromiseEntity> {
    return this.promiseRepo.save(this.promiseRepo.create({ workspaceId, invoiceId, accountId, promisedDate, promisedAmount }));
  }

  async checkBrokenPromises(workspaceId: string): Promise<PaymentPromiseEntity[]> {
    const broken = await this.promiseRepo.find({
      where: { workspaceId, kept: false, broken: false, promisedDate: LessThan(new Date()) },
    });
    for (const p of broken) {
      p.broken = true;
      await this.promiseRepo.save(p);
    }
    return broken;
  }

  // --- ANALYTICS ---
  async getDSO(workspaceId: string): Promise<number> {
    const paid = await this.invoiceRepo.find({ where: { workspaceId, status: InvoiceStatus.PAID } });
    if (!paid.length) return 0;
    const totalDays = paid.reduce((s, inv) => {
      const days = (new Date(inv.paidAt!).getTime() - new Date(inv.issueDate).getTime()) / 86_400_000;
      return s + days;
    }, 0);
    return Math.round(totalDays / paid.length);
  }

  async getAgingReport(workspaceId: string): Promise<Record<string, { count: number; total: number }>> {
    const unpaid = await this.invoiceRepo.find({
      where: { workspaceId, status: In([InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.OVERDUE, InvoiceStatus.PARTIALLY_PAID]) },
    });

    const buckets: Record<string, { count: number; total: number }> = {
      'current': { count: 0, total: 0 },
      '1-30': { count: 0, total: 0 },
      '31-60': { count: 0, total: 0 },
      '61-90': { count: 0, total: 0 },
      '90+': { count: 0, total: 0 },
    };

    for (const inv of unpaid) {
      const days = Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / 86_400_000);
      const bucket = days <= 0 ? 'current' : days <= 30 ? '1-30' : days <= 60 ? '31-60' : days <= 90 ? '61-90' : '90+';
      buckets[bucket].count++;
      buckets[bucket].total += Number(inv.balanceDue);
    }

    return buckets;
  }

  async getCashForecast(workspaceId: string, days: number): Promise<{ date: string; expected: number }[]> {
    const endDate = new Date(Date.now() + days * 86_400_000);
    const upcoming = await this.invoiceRepo.find({
      where: {
        workspaceId,
        status: In([InvoiceStatus.SENT, InvoiceStatus.VIEWED]),
        dueDate: Between(new Date(), endDate),
      },
      order: { dueDate: 'ASC' },
    });

    const forecast: Record<string, number> = {};
    for (const inv of upcoming) {
      const key = new Date(inv.dueDate).toISOString().split('T')[0];
      forecast[key] = (forecast[key] ?? 0) + Number(inv.balanceDue);
    }

    return Object.entries(forecast).map(([date, expected]) => ({ date, expected }));
  }

  async getCollectionEffectiveness(workspaceId: string): Promise<number> {
    const totalInvoiced = await this.invoiceRepo.sum('totalAmount', { workspaceId }) ?? 0;
    const totalCollected = await this.invoiceRepo.sum('amountPaid', { workspaceId }) ?? 0;
    return totalInvoiced ? Math.round((totalCollected / totalInvoiced) * 100) : 0;
  }

  private async findInvoiceOrFail(invoiceId: string): Promise<InvoiceEntity> {
    const inv = await this.invoiceRepo.findOne({ where: { id: invoiceId } });
    if (!inv) throw new NotFoundException(`Invoice ${invoiceId} not found`);
    return inv;
  }
}
