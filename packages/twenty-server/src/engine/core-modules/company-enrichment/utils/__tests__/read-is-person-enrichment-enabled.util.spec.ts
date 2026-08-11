import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { readIsPersonEnrichmentEnabled } from 'src/engine/core-modules/company-enrichment/utils/read-is-person-enrichment-enabled.util';

const buildConfigService = (configValues: Record<string, unknown>) =>
  ({
    get: (key: string) => configValues[key],
  }) as TwentyConfigService;

describe('readIsPersonEnrichmentEnabled', () => {
  it('should be enabled when the onboarding ai chat and the api key are configured', () => {
    expect(
      readIsPersonEnrichmentEnabled(
        buildConfigService({
          IS_ONBOARDING_AI_CHAT_ENABLED: true,
          PEOPLE_DATA_LABS_API_KEY: 'pdl-key',
        }),
      ),
    ).toBe(true);
  });

  it('should be disabled when the onboarding ai chat is off, even for a configured book-call step', () => {
    expect(
      readIsPersonEnrichmentEnabled(
        buildConfigService({
          IS_ONBOARDING_AI_CHAT_ENABLED: false,
          CALENDAR_BOOKING_PAGE_ID: 'team/twenty/talk-to-us',
          ONBOARDING_BOOK_CALL_MIN_EMPLOYEE_COUNT: 50,
          PEOPLE_DATA_LABS_API_KEY: 'pdl-key',
        }),
      ),
    ).toBe(false);
  });
});
