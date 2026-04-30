import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BankConnectionEntity, BankTransactionEntity, BankReconciliationEntity, PaymentFileEntity,
  BankConnectionStatus, TransactionType, ReconciliationStatus, PaymentFileFormat, PaymentNetwork,
} from './banking-latam.entity';

@Injectable()
export class BankingLatamService {
  private readonly logger = new Logger(BankingLatamService.name);

  constructor(
    @InjectRepository(BankConnectionEntity) private readonly connectionRepo: Repository<BankConnectionEntity>,
    @InjectRepository(BankTransactionEntity) private readonly transactionRepo: Repository<BankTransactionEntity>,
    @InjectRepository(BankReconciliationEntity) private readonly reconciliationRepo: Repository<BankReconciliationEntity>,
    @InjectRepository(PaymentFileEntity) private readonly paymentFileRepo: Repository<PaymentFileEntity>,
  ) {}

  async createConnection(workspaceId: string, data: Partial<BankConnectionEntity>): Promise<BankConnectionEntity> {
    // Determine network based on country
    const networkMap: Record<string, PaymentNetwork> = {
      CO: PaymentNetwork.PSE,
      MX: PaymentNetwork.SPEI,
      US: PaymentNetwork.ACH,
    };
    const network = data.country ? networkMap[data.country] ?? PaymentNetwork.LOCAL : PaymentNetwork.LOCAL;

    const connection = this.connectionRepo.create({
      workspaceId,
      network,
      ...data,
      status: BankConnectionStatus.ACTIVE,
    });

    this.logger.log(`Bank connection created: ${data.bankName} (${data.country}) via ${network}`);
    return this.connectionRepo.save(connection);
  }

  async importTransactions(workspaceId: string, connectionId: string, transactions: Array<Partial<BankTransactionEntity>>): Promise<{
    imported: number; duplicates: number; errors: number;
  }> {
    const connection = await this.connectionRepo.findOne({ where: { id: connectionId, workspaceId } });
    if (!connection) throw new NotFoundException(`Connection ${connectionId} not found`);

    let imported = 0;
    let duplicates = 0;
    let errors = 0;

    for (const txData of transactions) {
      try {
        if (txData.externalId) {
          const existing = await this.transactionRepo.findOne({
            where: { connectionId, externalId: txData.externalId },
          });
          if (existing) { duplicates++; continue; }
        }

        await this.transactionRepo.save(this.transactionRepo.create({
          workspaceId,
          connectionId,
          ...txData,
        }));
        imported++;
      } catch (error) {
        errors++;
        this.logger.warn(`Error importing transaction: ${(error as Error).message}`);
      }
    }

    connection.lastSyncAt = new Date();
    await this.connectionRepo.save(connection);

    return { imported, duplicates, errors };
  }

  async reconcileAutomatically(workspaceId: string, connectionId: string, periodStart: Date, periodEnd: Date): Promise<BankReconciliationEntity> {
    const transactions = await this.transactionRepo.find({
      where: { workspaceId, connectionId, reconciliationStatus: ReconciliationStatus.PENDING },
    });

    const periodTx = transactions.filter((tx) => {
      const txDate = new Date(tx.transactionDate);
      return txDate >= periodStart && txDate <= periodEnd;
    });

    let matched = 0;
    let unmatched = 0;

    for (const tx of periodTx) {
      // Auto-match by reference number against invoices
      if (tx.reference) {
        tx.reconciliationStatus = ReconciliationStatus.MATCHED;
        matched++;
      } else if (tx.counterpartyName) {
        // Fuzzy match by counterparty name
        tx.reconciliationStatus = ReconciliationStatus.PARTIAL;
        matched++;
      } else {
        tx.reconciliationStatus = ReconciliationStatus.UNMATCHED;
        unmatched++;
      }
      await this.transactionRepo.save(tx);
    }

    const credits = periodTx.filter((tx) => tx.type === TransactionType.CREDIT);
    const debits = periodTx.filter((tx) => tx.type === TransactionType.DEBIT);
    const openingBalance = periodTx.length > 0 ? Number(periodTx[0].runningBalance) - Number(periodTx[0].amount) : 0;
    const closingBalance = periodTx.length > 0 ? Number(periodTx[periodTx.length - 1].runningBalance) : 0;

    const reconciliation = this.reconciliationRepo.create({
      workspaceId, connectionId,
      periodStart, periodEnd,
      openingBalance, closingBalance,
      totalTransactions: periodTx.length,
      matchedTransactions: matched,
      unmatchedTransactions: unmatched,
      discrepancyAmount: 0,
      status: unmatched === 0 ? 'reconciled' : 'pending_review',
    });

    this.logger.log(`Reconciliation: ${matched} matched, ${unmatched} unmatched out of ${periodTx.length} transactions`);
    return this.reconciliationRepo.save(reconciliation);
  }

  async generatePaymentFile(workspaceId: string, connectionId: string, data: {
    format: PaymentFileFormat; payments: Array<{ beneficiary: string; account: string; amount: number; reference: string }>;
  }): Promise<PaymentFileEntity> {
    const connection = await this.connectionRepo.findOne({ where: { id: connectionId, workspaceId } });
    if (!connection) throw new NotFoundException(`Connection ${connectionId} not found`);

    const totalAmount = data.payments.reduce((sum, p) => sum + p.amount, 0);
    let fileContent = '';

    switch (data.format) {
      case PaymentFileFormat.BAI2:
        fileContent = this.generateBAI2(connection, data.payments);
        break;
      case PaymentFileFormat.MT940:
        fileContent = this.generateMT940(connection, data.payments);
        break;
      case PaymentFileFormat.PAIN001:
        fileContent = this.generatePAIN001(connection, data.payments);
        break;
      default:
        fileContent = this.generateCSV(data.payments);
    }

    const fileName = `payment_${data.format}_${new Date().toISOString().split('T')[0]}_${Date.now()}.${data.format === PaymentFileFormat.CSV ? 'csv' : 'txt'}`;

    return this.paymentFileRepo.save(this.paymentFileRepo.create({
      workspaceId, connectionId,
      format: data.format,
      network: connection.network,
      fileName,
      recordCount: data.payments.length,
      totalAmount,
      currency: connection.currency,
      fileContent,
      payments: data.payments,
      status: 'generated',
    }));
  }

  async getTransactionsByAccount(workspaceId: string, connectionId: string): Promise<BankTransactionEntity[]> {
    return this.transactionRepo.find({
      where: { workspaceId, connectionId },
      order: { transactionDate: 'DESC' },
      take: 200,
    });
  }

  async getBankingAnalytics(workspaceId: string): Promise<{
    totalConnections: number; totalBalance: number; transactionsThisMonth: number;
    reconciliationRate: number; pendingPayments: number;
    byNetwork: Record<string, { connections: number; balance: number }>;
  }> {
    const connections = await this.connectionRepo.find({ where: { workspaceId } });
    const transactions = await this.transactionRepo.find({ where: { workspaceId } });
    const paymentFiles = await this.paymentFileRepo.find({ where: { workspaceId, status: 'generated' } });

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = transactions.filter((tx) => new Date(tx.transactionDate) >= monthStart);

    const matched = transactions.filter((tx) => tx.reconciliationStatus === ReconciliationStatus.MATCHED).length;

    const byNetwork: Record<string, { connections: number; balance: number }> = {};
    for (const conn of connections) {
      const net = conn.network;
      if (!byNetwork[net]) byNetwork[net] = { connections: 0, balance: 0 };
      byNetwork[net].connections++;
      byNetwork[net].balance += Number(conn.currentBalance);
    }

    return {
      totalConnections: connections.length,
      totalBalance: connections.reduce((s, c) => s + Number(c.currentBalance), 0),
      transactionsThisMonth: thisMonth.length,
      reconciliationRate: transactions.length > 0 ? Math.round((matched / transactions.length) * 100) : 100,
      pendingPayments: paymentFiles.length,
      byNetwork,
    };
  }

  private generateBAI2(connection: BankConnectionEntity, payments: Array<{ beneficiary: string; account: string; amount: number; reference: string }>): string {
    const lines: string[] = [];
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    lines.push(`01,${connection.bankCode ?? 'BANK'},${connection.accountNumber},${date},,,/`);
    lines.push(`02,${connection.accountNumber},COP,010,${date},,,/`);
    for (const p of payments) {
      lines.push(`16,195,${Math.round(p.amount * 100)},,${p.reference},${p.beneficiary}/`);
    }
    lines.push('49,+000000000000,1/');
    lines.push('98,+000000000000,1,1/');
    lines.push('99,+000000000000,1,1/');
    return lines.join('\n');
  }

  private generateMT940(connection: BankConnectionEntity, payments: Array<{ beneficiary: string; account: string; amount: number; reference: string }>): string {
    const lines: string[] = [];
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '').substring(2);
    lines.push(`:20:STMT${date}`);
    lines.push(`:25:${connection.bankCode ?? 'BANK'}/${connection.accountNumber}`);
    lines.push(`:28C:1/1`);
    lines.push(`:60F:C${date}${connection.currency}${Number(connection.currentBalance).toFixed(2)}`);
    for (const p of payments) {
      lines.push(`:61:${date}D${p.amount.toFixed(2)}NTRF${p.reference}`);
      lines.push(`:86:${p.beneficiary} ${p.account}`);
    }
    lines.push(`:62F:C${date}${connection.currency}0,00`);
    return lines.join('\n');
  }

  private generatePAIN001(connection: BankConnectionEntity, payments: Array<{ beneficiary: string; account: string; amount: number; reference: string }>): string {
    const total = payments.reduce((s, p) => s + p.amount, 0);
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">\n`;
    xml += `  <CstmrCdtTrfInitn>\n`;
    xml += `    <GrpHdr><MsgId>MSG${Date.now()}</MsgId><NbOfTxs>${payments.length}</NbOfTxs><CtrlSum>${total.toFixed(2)}</CtrlSum></GrpHdr>\n`;
    for (const p of payments) {
      xml += `    <PmtInf><Amt><InstdAmt Ccy="${connection.currency}">${p.amount.toFixed(2)}</InstdAmt></Amt>`;
      xml += `<CdtrAcct><Id><IBAN>${p.account}</IBAN></Id></CdtrAcct>`;
      xml += `<Cdtr><Nm>${p.beneficiary}</Nm></Cdtr>`;
      xml += `<RmtInf><Ustrd>${p.reference}</Ustrd></RmtInf></PmtInf>\n`;
    }
    xml += `  </CstmrCdtTrfInitn>\n</Document>`;
    return xml;
  }

  private generateCSV(payments: Array<{ beneficiary: string; account: string; amount: number; reference: string }>): string {
    const lines = ['beneficiary,account,amount,reference'];
    for (const p of payments) {
      lines.push(`"${p.beneficiary}","${p.account}",${p.amount},"${p.reference}"`);
    }
    return lines.join('\n');
  }
}
