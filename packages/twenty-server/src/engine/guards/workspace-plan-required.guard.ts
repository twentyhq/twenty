/* @license Enterprise */

import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { isDefined } from 'twenty-shared/utils';

import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { SKIP_PLAN_REQUIRED_KEY } from 'src/engine/guards/decorators/skip-plan-required.decorator';
import { assertRequestWorkspaceHasRequiredPlan } from 'src/engine/guards/utils/assert-request-workspace-has-required-plan.util';
import { getRequest } from 'src/utils/extract-request';

/**
 * Default-deny product APIs when cloud billing requires plan selection.
 * Opt out with @SkipPlanRequired() on auth/billing/onboarding bootstrap paths.
 * Disabled unless IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED is true.
 */
@Injectable()
export class WorkspacePlanRequiredGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly billingService: BillingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = getRequest(context);
    const workspaceId = request?.workspace?.id as string | undefined;

    const skipPlanRequired = this.reflector.getAllAndOverride<boolean>(
      SKIP_PLAN_REQUIRED_KEY,
      [context.getHandler(), context.getClass()],
    );

    await assertRequestWorkspaceHasRequiredPlan({
      isEnforcementEnabled: this.twentyConfigService.get(
        'IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED',
      ),
      workspaceId: isDefined(workspaceId) ? workspaceId : undefined,
      skipPlanRequired: skipPlanRequired === true,
      assertWorkspaceHasRequiredPlan: (id) =>
        this.billingService.assertWorkspaceHasRequiredPlan(id),
    });

    return true;
  }
}
