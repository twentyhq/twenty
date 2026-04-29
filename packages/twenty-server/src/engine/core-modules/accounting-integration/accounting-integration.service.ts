import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AccountingConnectionEntity, AccountingSyncLogEntity, TaxRuleEntity,
  RevenueRecognitionEntity, SalesCommissionEntity, AccountingProvider,
} from './accounting-integration.entity';

@Injectable()
export class AccountingIntegrationService {
  constructor(
    @InjectRepository(AccountingConnectionEntity) private readonly connRepo: Repository<AccountingConnectionEntity>,
    @InjectRepository(AccountingSyncLogEntity) private readonly logRepo: Repository<AccountingSyncLogEntity>,
    @InjectRepository(TaxRuleEntity) private readonly taxRepo: Repository<TaxRuleEntity>,
    @InjectRepository(RevenueRecognitionEntity) private readonly revenueRepo: Repository<RevenueRecognitionEntity>,
    @InjectRepository(SalesCommissionEntity) private readonly commissionRepo: Repository<SalesCommissionEntity>,
  ) {}

  // --- CONNECTIONS ---
  async createConnection(workspaceId: string, data: Partial<AccountingConnectionEntity>): Promise<AccountingConnectionEntity> {
    return this.connRepo.save(this.connRepo.create({ workspaceId, ...data }));
  }

  async syncInvoiceToAccounting(workspaceId: string, connectionId: string, invoiceData: Record<string, unknown>): Promise<AccountingSyncLogEntity> {
    const conn = await this.connRepo.findOne({ where: { id: connectionId, workspaceId } });
    if (!conn) throw new NotFoundException(`Connection ${connectionId} not found`);

    const log = await this.logRepo.save(this.logRepo.create({
      workspaceId, connectionId, entityType: 'invoice',
      entityId: invoiceData['id'] as string, direction: 'crm_to_accounting',
      status: 'success', payload: invoiceData,
    }));

    conn.lastSyncAt = new Date();
    await this.connRepo.save(conn);
    return log;
  }

  async recordPaymentFromAccounting(workspaceId: string, connectionId: string, paymentData: Record<string, unknown>): Promise<AccountingSyncLogEntity> {
    return this.logRepo.save(this.logRepo.create({
      workspaceId, connectionId, entityType: 'payment',
      entityId: paymentData['id'] as string, direction: 'accounting_to_crm',
      status: 'success', payload: paymentData,
    }));
  }

  // --- TAX ---
  async createTaxRule(workspaceId: string, data: Partial<TaxRuleEntity>): Promise<TaxRuleEntity> {
    return this.taxRepo.save(this.taxRepo.create({ workspaceId, ...data }));
  }

  async calculateTax(workspaceId: string, amount: number, country: string): Promise<{ tax: number; withholding: number; net: number }> {
    const rules = await this.taxRepo.find({ where: { workspaceId, country, isActive: true } });
    let tax = 0;
    let withholding = 0;
    for (const rule of rules) {
      if (rule.isWithholding) {
        withholding += amount * (Number(rule.withholdingRate) / 100);
      } else {
        tax += amount * (Number(rule.rate) / 100);
      }
    }
    return { tax: Math.round(tax), withholding: Math.round(withholding), net: Math.round(amount + tax - withholding) };
  }

  // --- REVENUE RECOGNITION ---
  async createRevenueSchedule(workspaceId: string, dealId: string, totalAmount: number, type: string, deferralMonths?: number): Promise<RevenueRecognitionEntity> {
    const recognized = type === 'immediate' ? totalAmount : 0;
    return this.revenueRepo.save(this.revenueRepo.create({
      workspaceId, dealId, totalAmount, recognitionType: type,
      deferralMonths, recognized, deferred: totalAmount - recognized, startDate: new Date(),
    }));
  }

  async processMonthlyRecognition(workspaceId: string): Promise<number> {
    const schedules = await this.revenueRepo.find({ where: { workspaceId, recognitionType: 'deferred' } });
    let processed = 0;
    for (const s of schedules) {
      if (Number(s.deferred) > 0 && s.deferralMonths > 0) {
        const monthly = Number(s.totalAmount) / s.deferralMonths;
        s.recognized = Math.min(Number(s.totalAmount), Number(s.recognized) + monthly);
        s.deferred = Number(s.totalAmount) - Number(s.recognized);
        await this.revenueRepo.save(s);
        processed++;
      }
    }
    return processed;
  }

  // --- COMMISSIONS ---
  async calculateCommission(workspaceId: string, repId: string, dealId: string, dealAmount: number, commissionRate: number): Promise<SalesCommissionEntity> {
    return this.commissionRepo.save(this.commissionRepo.create({
      workspaceId, repId, dealId, dealAmount,
      commissionRate, commissionAmount: dealAmount * (commissionRate / 100),
      period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    }));
  }

  async getCommissionsByRep(workspaceId: string, repId: string, period?: string): Promise<{ total: number; items: SalesCommissionEntity[] }> {
    const where: Record<string, unknown> = { workspaceId, repId };
    if (period) where['period'] = period;
    const items = await this.commissionRepo.find({ where: where as any, order: { createdAt: 'DESC' } });
    return { total: items.reduce((s, c) => s + Number(c.commissionAmount), 0), items };
  }

  // --- FINANCIAL REPORTS ---
  async getPLByClient(workspaceId: string): Promise<Array<{ accountId: string; revenue: number; commissions: number; margin: number }>> {
    const revenues = await this.revenueRepo.find({ where: { workspaceId } });
    const commissions = await this.commissionRepo.find({ where: { workspaceId } });

    const byDeal: Record<string, { revenue: number; commission: number }> = {};
    for (const r of revenues) {
      byDeal[r.dealId] = { revenue: Number(r.recognized), commission: 0 };
    }
    for (const c of commissions) {
      if (byDeal[c.dealId]) byDeal[c.dealId].commission += Number(c.commissionAmount);
    }

    return Object.entries(byDeal).map(([dealId, data]) => ({
      accountId: dealId,
      revenue: data.revenue,
      commissions: data.commission,
      margin: data.revenue - data.commission,
    }));
  }
}
