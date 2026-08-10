import { isNonEmptyString } from '@sniptt/guards';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// Unlike company enrichment, the onboarding AI chat is the only consumer of
// person enrichment: the book-call qualification never reads person data.
export const readIsPersonEnrichmentEnabled = (
  twentyConfigService: TwentyConfigService,
): boolean =>
  twentyConfigService.get('IS_ONBOARDING_AI_CHAT_ENABLED') &&
  isNonEmptyString(twentyConfigService.get('PEOPLE_DATA_LABS_API_KEY'));
