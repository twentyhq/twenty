import { type Location } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { isMatchingLocation } from '~/utils/isMatchingLocation';

const PLAN_REQUIRED_EXEMPT_PATHS = [
  AppPath.PlanRequired,
  AppPath.PlanRequiredSuccess,
  AppPath.BookCall,
] as const;

/** Paths where BILLING_PLAN_REQUIRED must not navigate (avoid redirect loops). */
export const isPlanRequiredExemptPath = (location: Location): boolean =>
  PLAN_REQUIRED_EXEMPT_PATHS.some((path) => isMatchingLocation(location, path));
