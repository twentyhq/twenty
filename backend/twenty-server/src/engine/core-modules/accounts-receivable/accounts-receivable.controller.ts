import { Controller, Get, Post, Body, Param, Logger, HttpCode, NotFoundException } from '@nestjs/common';

import { CustomerPortalService } from './customer-portal.service';
import { AccountsReceivableService } from './accounts-receivable.service';
import { PaymentMethod } from './accounts-receivable.entity';

@Controller('rest/ar')
export class AccountsReceivableController {
  private readonly logger = new Logger(AccountsReceivableController.name);

  constructor(
    private readonly portalService: CustomerPortalService,
    private readonly arService: AccountsReceivableService,
  ) {}

  @Get('portal/:token')
  async portalAccess(@Param('token') token: string) {
    const access = await this.portalService.validatePortalToken(token);

    if (!access) throw new NotFoundException('Invalid or expired portal token');

    const summary = await this.portalService.getCustomerInvoiceSummary(
      access.workspaceId,
      access.accountId,
    );
    const invoices = await this.portalService.getCustomerInvoices(
      access.workspaceId,
      access.accountId,
    );

    return { success: true, account: access.accountId, summary, invoices };
  }

  @Post('portal/:token/pay/:invoiceId')
  @HttpCode(200)
  async initiatePayment(
    @Param('token') token: string,
    @Param('invoiceId') invoiceId: string,
    @Body() payload: { gateway?: string; amount?: number },
  ) {
    const access = await this.portalService.validatePortalToken(token);

    if (!access) throw new NotFoundException('Invalid or expired portal token');

    this.logger.log(`Portal payment: invoice ${invoiceId} (account: ${access.accountId})`);

    const paymentLink = await this.portalService.generatePaymentLink(
      invoiceId,
      payload.gateway ?? 'stripe',
    );

    return { success: true, paymentLink };
  }

  @Post('portal/:token/dispute/:invoiceId')
  @HttpCode(200)
  async openDispute(
    @Param('token') token: string,
    @Param('invoiceId') invoiceId: string,
    @Body() payload: { reason: string; description?: string; disputedAmount?: number },
  ) {
    const access = await this.portalService.validatePortalToken(token);

    if (!access) throw new NotFoundException('Invalid or expired portal token');

    this.logger.log(`Portal dispute: invoice ${invoiceId} (account: ${access.accountId})`);

    const dispute = await this.portalService.openDisputeFromPortal(
      access.workspaceId,
      invoiceId,
      payload,
    );

    return { success: true, disputeId: dispute.id };
  }
}
