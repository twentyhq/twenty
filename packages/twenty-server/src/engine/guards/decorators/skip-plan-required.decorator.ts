/* @license Enterprise */

import { SetMetadata } from '@nestjs/common';

export const SKIP_PLAN_REQUIRED_KEY = 'skip-plan-required';

/**
 * Opt out of WorkspacePlanRequiredGuard for handlers unpaid workspaces
 * must still call (billing checkout, auth, onboarding bootstrap, etc.).
 */
export const SkipPlanRequired = () => SetMetadata(SKIP_PLAN_REQUIRED_KEY, true);
