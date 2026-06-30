import { describe, expect, it } from 'vitest';

import { PDL_COMPANY_DATA_MOCK } from 'src/logic-functions/__mocks__/pdl-company-data.mock';
import { mapCompany } from 'src/logic-functions/utils/map-company';

describe('mapCompany', () => {
  it('maps standard fields including the address composite', () => {
    const { standard } = mapCompany(PDL_COMPANY_DATA_MOCK);

    expect(standard.name).toBe('Acme Corp');
    expect(standard.domainName).toMatchObject({ primaryLinkUrl: 'acme.com' });
    expect(standard.address).toMatchObject({
      addressCity: 'San Francisco',
      addressPostcode: '94107',
      addressCountry: 'United States',
    });
  });

  it('converts USD funding to currency micros', () => {
    const { pdl } = mapCompany(PDL_COMPANY_DATA_MOCK);

    expect(pdl.pdlTotalFunding).toEqual({
      amountMicros: 1_234_500_000,
      currencyCode: 'USD',
    });
  });

  it('maps select and multi-select funding fields, dropping unknowns', () => {
    const { pdl } = mapCompany(PDL_COMPANY_DATA_MOCK);

    expect(pdl.pdlSizeRange).toBe('FIFTY_ONE_TO_TWO_HUNDRED');
    expect(pdl.pdlCompanyType).toBe('PRIVATE');
    expect(pdl.pdlIndustry).toBe('ACCOUNTING');
    expect(pdl.pdlLocationContinent).toBe('NORTH_AMERICA');
    expect(pdl.pdlLatestFundingStage).toBe('SERIES_A');
    expect(pdl.pdlFundingStages).toEqual(['SEED', 'SERIES_A']);
  });

  it('maps numbers, dates, arrays and raw json', () => {
    const { pdl } = mapCompany(PDL_COMPANY_DATA_MOCK);

    expect(pdl.pdlEmployeeCount).toBe(120);
    expect(pdl.pdlFoundedYear).toBe(2001);
    expect(pdl.pdlLastFundingDate).toBe('2020-05-01');
    expect(pdl.pdlTags).toEqual(['saas', 'b2b']);
    expect(pdl.pdlNaics).toEqual([{ naics_code: '541511' }]);
  });
});
