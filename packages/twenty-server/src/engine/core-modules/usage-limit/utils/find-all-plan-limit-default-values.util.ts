import { isPlainObject } from 'twenty-shared/utils';

import { PLAN_LIMIT_DEFAULT_SECTION_KEYS } from 'src/engine/core-modules/usage-limit/constants/plan-limit-default-section-keys.constant';
import { type PlanLimitDefaultValue } from 'src/engine/core-modules/usage-limit/types/plan-limit-default-value.type';
import { findPlanSectionLimitDefaultValues } from 'src/engine/core-modules/usage-limit/utils/find-plan-section-limit-default-values.util';

export const findAllPlanLimitDefaultValues = (
  plans: Record<string, unknown>,
): PlanLimitDefaultValue[] =>
  Object.values(plans)
    .filter(isPlainObject)
    .flatMap((plan) =>
      PLAN_LIMIT_DEFAULT_SECTION_KEYS.flatMap((sectionKey) =>
        findPlanSectionLimitDefaultValues(plan[sectionKey]),
      ),
    );
