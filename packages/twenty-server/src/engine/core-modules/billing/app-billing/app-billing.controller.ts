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
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { type SubscriptionInactiveReason } from 'src/engine/core-modules/billing/types/subscription-inactive-reason.type';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';

// On top of the executor's throttle: application-access tokens are JWTs usable outside the runtime
const APP_BILLING_CHARGE_THROTTLE_LIMIT = 1000;
const APP_BILLING_CHARGE_THROTTLE_TTL_MS = 60_000;

const CREDIT_UNAVAILABLE_REASON_BY_SERVER_REASON: Record<
  SubscriptionInactiveReason | 'NO_CREDITS',
  CreditUnavailableReason
> = {
  WORKSPACE_SUSPENDED: 'workspace-suspended',
  NO_SUBSCRIPTION: 'no-subscription',
  NO_CREDITS: 'no-credits',
};

@Controller(`${ApiPath.App}/billing`)
@UseGuards(
  JwtAuthGuard,
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  }),
  NoPermissionGuard,
)
export class AppBillingController {
  constructor(
    private readonly appBillingService: AppBillingService,
    private readonly billingUsageService: BillingUsageService,
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

    const creditAvailability =
      await this.billingUsageService.getCreditAvailability(
        request.workspace.id,
      );

    return creditAvailability.hasAvailableCredits
      ? { hasAvailableCredits: true }
      : {
          hasAvailableCredits: false,
          reason:
            CREDIT_UNAVAILABLE_REASON_BY_SERVER_REASON[
              creditAvailability.reason
            ],
        };
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
