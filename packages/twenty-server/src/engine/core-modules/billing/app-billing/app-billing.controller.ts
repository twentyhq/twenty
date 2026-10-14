/* @license Enterprise */

import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { Request } from 'express';
import {
  type CreditAvailability,
  type CreditUnavailableReason,
} from 'twenty-shared/application';
import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AppBillingService } from 'src/engine/core-modules/billing/app-billing/app-billing.service';
import { ChargeDto } from 'src/engine/core-modules/billing/app-billing/dtos/charge.dto';
import { type SubscriptionInactiveReason } from 'src/engine/core-modules/billing/types/subscription-inactive-reason.type';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UsageQuotaAdmissionService } from 'src/engine/core-modules/usage-limit/services/usage-quota-admission.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';

// On top of the executor's throttle: application-access tokens are JWTs usable outside the runtime
const APP_BILLING_CHARGE_THROTTLE_LIMIT = 1000;
const APP_BILLING_CHARGE_THROTTLE_TTL_MS = 60_000;

const CREDIT_UNAVAILABLE_REASON_BY_SUBSCRIPTION_INACTIVE_REASON: Record<
  SubscriptionInactiveReason,
  CreditUnavailableReason
> = {
  WORKSPACE_SUSPENDED: 'workspace-suspended',
  NO_SUBSCRIPTION: 'no-subscription',
};

@Controller(`${ApiPath.App}/billing`)
@UseGuards(
  JwtAuthGuard,
  AuthPrincipalGuard({
    userSession: false,
    apiKey: false,
    oauthClient: false,
    application: true,
  }),
  NoPermissionGuard,
)
export class AppBillingController {
  constructor(
    private readonly appBillingService: AppBillingService,
    private readonly usageQuotaAdmissionService: UsageQuotaAdmissionService,
    private readonly throttlerService: ThrottlerService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  // Lets an app check credits before starting work; returns a verdict, never a balance an app has no business reading
  @Get('credits')
  async credits(@Req() request: Request): Promise<CreditAvailability> {
    if (!isDefined(request.application) || !isDefined(request.workspace)) {
      throw new ForbiddenException(
        'App billing endpoint requires an APPLICATION_ACCESS token.',
      );
    }

    await this.throttlerService.tokenBucketThrottleOrThrow(
      `${request.workspace.id}-${request.application.id}-app-billing-credits`,
      1,
      APP_BILLING_CHARGE_THROTTLE_LIMIT,
      APP_BILLING_CHARGE_THROTTLE_TTL_MS,
    );

    const usageRefusal = await this.usageQuotaAdmissionService.findUsageRefusal(
      {
        workspaceId: request.workspace.id,
        resourceType: UsageResourceType.APP,
        operationType: UsageOperationType.ALL,
        spenders: { applicationId: request.application.id },
      },
    );

    if (!isDefined(usageRefusal)) {
      return { hasAvailableCredits: true };
    }

    if (usageRefusal.kind === 'subscriptionInactive') {
      return {
        hasAvailableCredits: false,
        reason:
          CREDIT_UNAVAILABLE_REASON_BY_SUBSCRIPTION_INACTIVE_REASON[
            usageRefusal.reason
          ],
      };
    }

    return { hasAvailableCredits: false, reason: 'no-credits' };
  }

  @Post('charge')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async charge(
    @Req() request: Request,
    @Body() charge: ChargeDto,
  ): Promise<void> {
    // Without billing no listener consumes the event, so fail fast rather than silently drop charges
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      throw new NotFoundException();
    }

    // Only application-access tokens populate `request.application`
    if (!isDefined(request.application) || !isDefined(request.workspace)) {
      throw new ForbiddenException(
        'App billing endpoint requires an APPLICATION_ACCESS token.',
      );
    }

    await this.throttlerService.tokenBucketThrottleOrThrow(
      `${request.workspace.id}-${request.application.id}-app-billing-charge`,
      1,
      APP_BILLING_CHARGE_THROTTLE_LIMIT,
      APP_BILLING_CHARGE_THROTTLE_TTL_MS,
    );

    await this.appBillingService.emitChargeEvent({
      workspaceId: request.workspace.id,
      applicationId: request.application.id,
      userWorkspaceId: request.userWorkspaceId,
      charge,
    });
  }
}
