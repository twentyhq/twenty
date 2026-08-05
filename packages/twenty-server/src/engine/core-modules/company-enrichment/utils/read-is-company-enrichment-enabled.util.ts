import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { readBookCallStepMinEmployeeCount } from 'src/engine/core-modules/onboarding/utils/read-book-call-step-min-employee-count.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// Enrichment is only worth running when something consumes it and the provider
// can actually answer, so callers can skip the round-trip entirely.
export const readIsCompanyEnrichmentEnabled = (
  twentyConfigService: TwentyConfigService,
): boolean => {
  const hasConsumer =
    twentyConfigService.get('IS_ONBOARDING_AI_CHAT_ENABLED') ||
    isDefined(readBookCallStepMinEmployeeCount(twentyConfigService));

  return (
    hasConsumer &&
    isNonEmptyString(twentyConfigService.get('PEOPLE_DATA_LABS_ENGINE_API_KEY'))
  );
};
