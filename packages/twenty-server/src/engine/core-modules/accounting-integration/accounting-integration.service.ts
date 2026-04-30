import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import {
  AccountingConnectionEntity, AccountingSyncLogEntity, TaxRuleEntity,
  RevenueRecognitionEntity, SalesCommissionEntity, AccountingProvider,
  ChartOfAccountEntity, JournalEntryEntity, AccountingPeriodEntity,
  AccountType, JournalEntryStatus, PeriodStatus,
} from './accounting-integration.entity';

@Injectable()
export class AccountingIntegrationService {
  constructor(
    @InjectRepository(AccountingConnectionEntity) private readonly connRepo: Repository<AccountingConnectionEntity>,
    @InjectRepository(AccountingSyncLogEntity) private readonly logRepo: Repository<AccountingSyncLogEntity>,
    @InjectRepository(TaxRuleEntity) private readonly taxRepo: Repository<TaxRuleEntity>,
    @InjectRepository(RevenueRecognitionEntity) private readonly revenueRepo: Repository<RevenueRecognitionEntity>,
    @InjectRepository(SalesCommissionEntity) private readonly commissionRepo: Repository<SalesCommissionEntity>,
    @InjectRepository(ChartOfAccountEntity) private readonly chartRepo: Repository<ChartOfAccountEntity>,
    @InjectRepository(JournalEntryEntity) private readonly journalRepo: Repository<JournalEntryEntity>,
    @InjectRepository(AccountingPeriodEntity) private readonly periodRepo: Repository<AccountingPeriodEntity>,
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

  // --- CHART OF ACCOUNTS ---

  async createChartOfAccounts(
    workspaceId: string,
    accounts: Array<{ code: string; name: string; type: AccountType; parentCode?: string }>,
  ): Promise<ChartOfAccountEntity[]> {
    const entities = accounts.map((account) =>
      this.chartRepo.create({
        workspaceId,
        code: account.code,
        name: account.name,
        type: account.type,
        parentCode: account.parentCode,
      }),
    );

    return this.chartRepo.save(entities);
  }

  // --- JOURNAL ENTRIES ---

  async createJournalEntry(
    workspaceId: string,
    data: { date: Date; description: string; entries: Array<{ accountCode: string; debit: number; credit: number }> },
  ): Promise<JournalEntryEntity> {
    const totalDebit = data.entries.reduce((sum, e) => sum + Number(e.debit), 0);
    const totalCredit = data.entries.reduce((sum, e) => sum + Number(e.credit), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException(
        `Journal entry is unbalanced: debits=${totalDebit}, credits=${totalCredit}`,
      );
    }

    // Validate all account codes exist
    for (const entry of data.entries) {
      const account = await this.chartRepo.findOne({
        where: { workspaceId, code: entry.accountCode },
      });
      if (!account) {
        throw new NotFoundException(`Account ${entry.accountCode} not found`);
      }
    }

    const period = new Date(data.date).toISOString().substring(0, 7);

    // Check period is not closed
    const closedPeriod = await this.periodRepo.findOne({
      where: { workspaceId, period, status: PeriodStatus.CLOSED },
    });
    if (closedPeriod) {
      throw new BadRequestException(`Period ${period} is closed`);
    }

    const journal = await this.journalRepo.save(
      this.journalRepo.create({
        workspaceId,
        date: data.date,
        description: data.description,
        lines: data.entries,
        status: JournalEntryStatus.POSTED,
        period,
      }),
    );

    // Update account balances
    for (const entry of data.entries) {
      const account = await this.chartRepo.findOne({
        where: { workspaceId, code: entry.accountCode },
      });
      if (account) {
        // Assets and expenses increase with debit; liabilities, equity, revenue increase with credit
        const isDebitNormal = account.type === AccountType.ASSET || account.type === AccountType.EXPENSE;
        const netEffect = isDebitNormal
          ? Number(entry.debit) - Number(entry.credit)
          : Number(entry.credit) - Number(entry.debit);
        account.balance = Number(account.balance) + netEffect;
        await this.chartRepo.save(account);
      }
    }

    return journal;
  }

  // --- FINANCIAL STATEMENTS ---

  async getTrialBalance(
    workspaceId: string,
    asOfDate?: Date,
  ): Promise<Array<{ code: string; name: string; type: AccountType; debit: number; credit: number }>> {
    const accounts = await this.chartRepo.find({ where: { workspaceId, isActive: true } });

    const trialBalance: Array<{ code: string; name: string; type: AccountType; debit: number; credit: number }> = [];

    for (const account of accounts) {
      let totalDebit = 0;
      let totalCredit = 0;

      const queryBuilder = this.journalRepo
        .createQueryBuilder('j')
        .where('j.workspaceId = :workspaceId', { workspaceId })
        .andWhere('j.status = :status', { status: JournalEntryStatus.POSTED });

      if (asOfDate) {
        queryBuilder.andWhere('j.date <= :asOfDate', { asOfDate });
      }

      const entries = await queryBuilder.getMany();

      for (const entry of entries) {
        for (const line of entry.lines ?? []) {
          if (line.accountCode === account.code) {
            totalDebit += Number(line.debit);
            totalCredit += Number(line.credit);
          }
        }
      }

      if (totalDebit > 0 || totalCredit > 0) {
        trialBalance.push({
          code: account.code,
          name: account.name,
          type: account.type,
          debit: totalDebit,
          credit: totalCredit,
        });
      }
    }

    return trialBalance;
  }

  async getProfitAndLoss(
    workspaceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ revenue: number; expenses: number; netIncome: number; details: Array<{ code: string; name: string; type: AccountType; amount: number }> }> {
    const entries = await this.journalRepo
      .createQueryBuilder('j')
      .where('j.workspaceId = :workspaceId', { workspaceId })
      .andWhere('j.status = :status', { status: JournalEntryStatus.POSTED })
      .andWhere('j.date >= :startDate', { startDate })
      .andWhere('j.date <= :endDate', { endDate })
      .getMany();

    const accountTotals: Record<string, number> = {};

    for (const entry of entries) {
      for (const line of entry.lines ?? []) {
        if (!accountTotals[line.accountCode]) accountTotals[line.accountCode] = 0;
        accountTotals[line.accountCode] += Number(line.credit) - Number(line.debit);
      }
    }

    const accounts = await this.chartRepo.find({ where: { workspaceId } });
    const accountMap = new Map(accounts.map((a) => [a.code, a]));

    let revenue = 0;
    let expenses = 0;
    const details: Array<{ code: string; name: string; type: AccountType; amount: number }> = [];

    for (const [code, amount] of Object.entries(accountTotals)) {
      const account = accountMap.get(code);
      if (!account) continue;

      if (account.type === AccountType.REVENUE) {
        revenue += amount;
        details.push({ code, name: account.name, type: account.type, amount });
      } else if (account.type === AccountType.EXPENSE) {
        expenses += Math.abs(amount);
        details.push({ code, name: account.name, type: account.type, amount: Math.abs(amount) });
      }
    }

    return { revenue, expenses, netIncome: revenue - expenses, details };
  }

  async getBalanceSheet(
    workspaceId: string,
    asOfDate: Date,
  ): Promise<{
    assets: Array<{ code: string; name: string; balance: number }>;
    liabilities: Array<{ code: string; name: string; balance: number }>;
    equity: Array<{ code: string; name: string; balance: number }>;
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
  }> {
    const trialBalance = await this.getTrialBalance(workspaceId, asOfDate);
    const accounts = await this.chartRepo.find({ where: { workspaceId } });
    const accountMap = new Map(accounts.map((a) => [a.code, a]));

    const assets: Array<{ code: string; name: string; balance: number }> = [];
    const liabilities: Array<{ code: string; name: string; balance: number }> = [];
    const equity: Array<{ code: string; name: string; balance: number }> = [];

    for (const tb of trialBalance) {
      const account = accountMap.get(tb.code);
      if (!account) continue;

      const balance = tb.debit - tb.credit;

      if (account.type === AccountType.ASSET) {
        assets.push({ code: tb.code, name: tb.name, balance });
      } else if (account.type === AccountType.LIABILITY) {
        liabilities.push({ code: tb.code, name: tb.name, balance: Math.abs(balance) });
      } else if (account.type === AccountType.EQUITY) {
        equity.push({ code: tb.code, name: tb.name, balance: Math.abs(balance) });
      }
    }

    return {
      assets,
      liabilities,
      equity,
      totalAssets: assets.reduce((s, a) => s + a.balance, 0),
      totalLiabilities: liabilities.reduce((s, l) => s + l.balance, 0),
      totalEquity: equity.reduce((s, e) => s + e.balance, 0),
    };
  }

  // --- PERIOD CLOSE ---

  async closePeriod(
    workspaceId: string,
    period: string,
  ): Promise<AccountingPeriodEntity> {
    let periodEntity = await this.periodRepo.findOne({
      where: { workspaceId, period },
    });

    if (periodEntity?.status === PeriodStatus.CLOSED) {
      throw new BadRequestException(`Period ${period} is already closed`);
    }

    if (!periodEntity) {
      periodEntity = this.periodRepo.create({ workspaceId, period });
    }

    // Create closing entries: zero out revenue and expense accounts into retained earnings
    const entries = await this.journalRepo.find({
      where: { workspaceId, period, status: JournalEntryStatus.POSTED },
    });

    const accountTotals: Record<string, number> = {};

    for (const entry of entries) {
      for (const line of entry.lines ?? []) {
        if (!accountTotals[line.accountCode]) accountTotals[line.accountCode] = 0;
        accountTotals[line.accountCode] += Number(line.credit) - Number(line.debit);
      }
    }

    const accounts = await this.chartRepo.find({ where: { workspaceId } });
    const accountMap = new Map(accounts.map((a) => [a.code, a]));
    const closingLines: Array<{ accountCode: string; debit: number; credit: number }> = [];
    let netIncome = 0;

    for (const [code, amount] of Object.entries(accountTotals)) {
      const account = accountMap.get(code);
      if (!account) continue;

      if (account.type === AccountType.REVENUE) {
        // Revenue has credit balance, close with debit
        closingLines.push({ accountCode: code, debit: Math.abs(amount), credit: 0 });
        netIncome += amount;
      } else if (account.type === AccountType.EXPENSE) {
        // Expense has debit balance, close with credit
        closingLines.push({ accountCode: code, debit: 0, credit: Math.abs(amount) });
        netIncome += amount;
      }
    }

    // Record the closing journal entry if there are lines to close
    if (closingLines.length > 0) {
      // Find or create a retained earnings account
      let retainedEarnings = await this.chartRepo.findOne({
        where: { workspaceId, code: '3900' },
      });
      if (!retainedEarnings) {
        retainedEarnings = await this.chartRepo.save(
          this.chartRepo.create({
            workspaceId,
            code: '3900',
            name: 'Retained Earnings',
            type: AccountType.EQUITY,
          }),
        );
      }

      // Balance the closing entry with retained earnings
      if (netIncome > 0) {
        closingLines.push({ accountCode: '3900', debit: 0, credit: netIncome });
      } else if (netIncome < 0) {
        closingLines.push({ accountCode: '3900', debit: Math.abs(netIncome), credit: 0 });
      }

      if (closingLines.length > 0) {
        const lastDay = new Date(`${period}-01`);
        lastDay.setMonth(lastDay.getMonth() + 1);
        lastDay.setDate(lastDay.getDate() - 1);

        await this.journalRepo.save(
          this.journalRepo.create({
            workspaceId,
            date: lastDay,
            description: `Closing entry for period ${period}`,
            lines: closingLines,
            status: JournalEntryStatus.POSTED,
            period,
          }),
        );
      }
    }

    periodEntity.status = PeriodStatus.CLOSED;
    periodEntity.closedAt = new Date();

    return this.periodRepo.save(periodEntity);
  }

  // --- THREE-WAY MATCH ---

  async threeWayMatch(
    workspaceId: string,
    purchaseOrderId: string,
    invoiceId: string,
    receiptId: string,
  ): Promise<{
    matched: boolean;
    purchaseOrder: Record<string, unknown> | null;
    invoice: Record<string, unknown> | null;
    receipt: Record<string, unknown> | null;
    discrepancies: string[];
  }> {
    // Fetch the three documents from sync logs
    const poLog = await this.logRepo.findOne({
      where: { workspaceId, entityId: purchaseOrderId, entityType: 'purchase_order' },
    });
    const invoiceLog = await this.logRepo.findOne({
      where: { workspaceId, entityId: invoiceId, entityType: 'invoice' },
    });
    const receiptLog = await this.logRepo.findOne({
      where: { workspaceId, entityId: receiptId, entityType: 'receipt' },
    });

    const discrepancies: string[] = [];

    if (!poLog) discrepancies.push(`Purchase order ${purchaseOrderId} not found`);
    if (!invoiceLog) discrepancies.push(`Invoice ${invoiceId} not found`);
    if (!receiptLog) discrepancies.push(`Receipt ${receiptId} not found`);

    if (discrepancies.length > 0) {
      return {
        matched: false,
        purchaseOrder: poLog?.payload ?? null,
        invoice: invoiceLog?.payload ?? null,
        receipt: receiptLog?.payload ?? null,
        discrepancies,
      };
    }

    const poAmount = Number(poLog?.payload?.['totalAmount'] ?? 0);
    const invoiceAmount = Number(invoiceLog?.payload?.['totalAmount'] ?? 0);
    const receiptQty = Number(receiptLog?.payload?.['quantity'] ?? 0);
    const poQty = Number(poLog?.payload?.['quantity'] ?? 0);

    if (Math.abs(poAmount - invoiceAmount) > 0.01) {
      discrepancies.push(
        `Amount mismatch: PO=${poAmount}, Invoice=${invoiceAmount}`,
      );
    }

    if (poQty > 0 && receiptQty > 0 && poQty !== receiptQty) {
      discrepancies.push(
        `Quantity mismatch: PO=${poQty}, Receipt=${receiptQty}`,
      );
    }

    return {
      matched: discrepancies.length === 0,
      purchaseOrder: poLog?.payload ?? null,
      invoice: invoiceLog?.payload ?? null,
      receipt: receiptLog?.payload ?? null,
      discrepancies,
    };
  }
}
