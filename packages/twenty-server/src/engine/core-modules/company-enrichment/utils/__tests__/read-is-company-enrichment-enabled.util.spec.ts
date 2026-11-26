import { readIsCompanyEnrichmentEnabled } from 'src/engine/core-modules/company-enrichment/utils/read-is-company-enrichment-enabled.util';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const buildConfigService = (values: Record<string, unknown>) => {
  const config: Record<string, unknown> = {
    IS_ONBOARDING_AI_CHAT_ENABLED: false,
    IS_BILLING_ENABLED: false,
    ...values,
  };

  return { get: (key: string) => config[key] } as TwentyConfigService;
};

describe('readIsCompanyEnrichmentEnabled', () => {
  it('should be enabled with the AI chat consumer and an api key', () => {
    expect(
      readIsCompanyEnrichmentEnabled(
        buildConfigService({
          IS_ONBOARDING_AI_CHAT_ENABLED: true,
          PEOPLE_DATA_LABS_API_KEY: 'pdl-key',
        }),
      ),
    ).toBe(true);
  });

  it('should be enabled with the Getting started consumer and an api key', () => {
    expect(
      readIsCompanyEnrichmentEnabled(
        buildConfigService({
          IS_ONBOARDING_AI_CHAT_ENABLED: false,
          IS_BILLING_ENABLED: true,
          PEOPLE_DATA_LABS_API_KEY: 'pdl-key',
        }),
      ),
    ).toBe(true);
  });

  it('should be disabled without any consumer', () => {
    expect(
      readIsCompanyEnrichmentEnabled(
        buildConfigService({
          IS_ONBOARDING_AI_CHAT_ENABLED: false,
          PEOPLE_DATA_LABS_API_KEY: 'pdl-key',
        }),
      ),
    ).toBe(false);
  });

  it('should be disabled without an api key even when a consumer is configured', () => {
    expect(
      readIsCompanyEnrichmentEnabled(
        buildConfigService({
          IS_ONBOARDING_AI_CHAT_ENABLED: true,
          PEOPLE_DATA_LABS_API_KEY: undefined,
        }),
      ),
    ).toBe(false);
  });

  it('should be disabled with neither a consumer nor an api key', () => {
    expect(readIsCompanyEnrichmentEnabled(buildConfigService({}))).toBe(false);
  });
});
