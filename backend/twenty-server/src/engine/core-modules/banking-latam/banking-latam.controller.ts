import { Controller, Post, Body, Headers, Logger, HttpCode } from '@nestjs/common';

import { BankingLatamService } from './banking-latam.service';
import { PaymentFileFormat, TransactionType } from './banking-latam.entity';

@Controller('rest/banking')
export class BankingLatamController {
  private readonly logger = new Logger(BankingLatamController.name);

  constructor(private readonly service: BankingLatamService) {}

  @Post('webhook/bank-feed')
  @HttpCode(200)
  async handleBankFeed(
    @Headers('x-workspace-id') workspaceId: string,
    @Body() payload: {
      connectionId: string;
      transactions: Array<{
        externalId?: string;
        amount: number;
        type: TransactionType;
        description?: string;
        counterpartyName?: string;
        reference?: string;
        transactionDate: string;
      }>;
    },
  ) {
    this.logger.log(`Bank feed: ${payload.transactions.length} transactions (workspace: ${workspaceId})`);
    const result = await this.service.importTransactions(
      workspaceId,
      payload.connectionId,
      payload.transactions.map((tx) => ({
        ...tx,
        transactionDate: new Date(tx.transactionDate),
      })),
    );

    return { success: true, ...result };
  }

  @Post('payment-file/generate')
  @HttpCode(200)
  async generatePaymentFile(
    @Headers('x-workspace-id') workspaceId: string,
    @Body() payload: {
      connectionId: string;
      format: PaymentFileFormat;
      payments: Array<{ beneficiary: string; account: string; amount: number; reference: string }>;
    },
  ) {
    this.logger.log(`Payment file: ${payload.format} with ${payload.payments.length} payments (workspace: ${workspaceId})`);
    const file = await this.service.generatePaymentFile(workspaceId, payload.connectionId, {
      format: payload.format,
      payments: payload.payments,
    });

    return { success: true, fileId: file.id, fileName: file.fileName };
  }
}
