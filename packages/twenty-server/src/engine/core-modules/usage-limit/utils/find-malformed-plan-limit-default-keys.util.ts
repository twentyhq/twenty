import { isPlainObject } from 'twenty-shared/utils';

import { PLAN_LIMIT_DEFAULT_SECTION_KEYS } from 'src/engine/core-modules/usage-limit/constants/plan-limit-default-section-keys.constant';
import { findPlanSectionLimitDefaultValues } from 'src/engine/core-modules/usage-limit/utils/find-plan-section-limit-default-values.util';

const isPlanLimitDefaultSectionKey = (
  key: string,
): key is (typeof PLAN_LIMIT_DEFAULT_SECTION_KEYS)[number] =>
  PLAN_LIMIT_DEFAULT_SECTION_KEYS.some((sectionKey) => sectionKey === key);

export const findMalformedPlanLimitDefaultKeys = (
  plans: Record<string, unknown>,
): string[] =>
  Object.entries(plans).flatMap(([planKey, plan]) => {
    if (!isPlainObject(plan)) {
      return [planKey];
    }

    return Object.entries(plan).flatMap(([sectionKey, section]) => {
      const sectionPath = `${planKey}.${sectionKey}`;

      if (
        !isPlanLimitDefaultSectionKey(sectionKey) ||
        !isPlainObject(section)
      ) {
        return [sectionPath];
      }

      const keptConfigVariables = new Set<string>(
        findPlanSectionLimitDefaultValues(section).map(
          ({ configVariable }) => configVariable,
        ),
      );

      return Object.keys(section)
        .filter((configVariable) => !keptConfigVariables.has(configVariable))
        .map((configVariable) => `${sectionPath}.${configVariable}`);
    });
  });
