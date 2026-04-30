import { Controller, Post, Get, Body, Headers, Logger, HttpCode } from '@nestjs/common';

import { SaaSPlatformService } from './saas-platform.service';

@Controller('rest/saas')
export class SaaSPlatformController {
  private readonly logger = new Logger(SaaSPlatformController.name);

  constructor(private readonly service: SaaSPlatformService) {}

  @Post('webhook/stripe')
  @HttpCode(200)
  async handleStripeSubscriptionWebhook(
    @Body() payload: {
      type: string;
      data: {
        object: {
          id: string;
          metadata?: { workspaceId?: string };
          status?: string;
          cancel_at_period_end?: boolean;
        };
      };
    },
  ) {
    const workspaceId = payload.data.object.metadata?.workspaceId;

    this.logger.log(`SaaS Stripe webhook: ${payload.type} (workspace: ${workspaceId ?? 'unknown'})`);

    if (!workspaceId) {
      return { success: false, error: 'Missing workspaceId in metadata' };
    }

    switch (payload.type) {
      case 'customer.subscription.updated':
        if (payload.data.object.status === 'past_due') {
          await this.service.suspendTenant(workspaceId, 'Payment past due');
        }
        break;
      case 'customer.subscription.deleted':
        await this.service.suspendTenant(workspaceId, 'Subscription cancelled');
        break;
      case 'invoice.paid':
        await this.service.reactivateTenant(workspaceId);
        break;
    }

    return { success: true, type: payload.type };
  }

  @Get('health')
  async healthCheck() {
    const dashboard = await this.service.getAdminDashboard();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      totalTenants: dashboard.totalTenants,
      activeTenants: dashboard.activeTenants,
    };
  }
}
